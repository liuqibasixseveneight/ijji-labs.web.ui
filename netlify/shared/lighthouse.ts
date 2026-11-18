import { paths } from '../../src/router/paths.ts';
import { store } from './blobs.ts';

// Daily Lighthouse scores from Google's PageSpeed Insights API, for the admin dashboard. One
// page and strategy per run (a run can take 20 seconds, and scheduled functions get 30), so
// the lighthouse-check function runs four times each morning, fifteen minutes apart.

export const PAGES = [
    { id: 'home', name: 'Home', path: paths.home },
    { id: 'privacy', name: 'IJJI Tracker privacy policy', path: paths.app('ijji-tracker').privacy },
] as const;
export const STRATEGIES = ['mobile', 'desktop'] as const;

export type PageId = (typeof PAGES)[number]['id'];
export type Strategy = (typeof STRATEGIES)[number];

export const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
export type Scores = Record<(typeof CATEGORIES)[number], number | null>;
/** The run's key timings: ms, except CLS (unitless). Missing on entries from before they were kept. */
export const METRICS = {
    fcp: 'first-contentful-paint',
    lcp: 'largest-contentful-paint',
    tbt: 'total-blocking-time',
    cls: 'cumulative-layout-shift',
    si: 'speed-index',
} as const;
export type Metrics = Record<keyof typeof METRICS, number | null>;
export type Result = { scores: Scores; metrics: Metrics };
export type Entry = { date: string; at: number; scores: Scores; metrics?: Metrics };

/** The four runs, in the order the morning's runs take them. */
export const COMBOS = PAGES.flatMap((page) =>
    STRATEGIES.map((strategy) => ({ page, strategy, key: `${page.id}-${strategy}` })),
);

/** Days of scores kept for each page and strategy. */
export const KEEP = 30;

const lighthouse = () => store('lighthouse');

/**
 * Runs PageSpeed Insights on one page: its scores out of 100 and its key timings, each null if
 * missing. The timings say why a score dropped (a high TBT, a slow LCP) without opening
 * PageSpeed.
 */
export const fetchScores = async (url: string, strategy: Strategy, apiKey?: string) => {
    const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    api.searchParams.set('url', url);
    api.searchParams.set('strategy', strategy);
    for (const category of CATEGORIES) api.searchParams.append('category', category);
    if (apiKey) api.searchParams.set('key', apiKey);

    const response = await fetch(api, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`PageSpeed Insights answered ${response.status}`);

    const body = (await response.json()) as {
        lighthouseResult?: {
            categories?: Record<string, { score: number | null }>;
            audits?: Record<string, { numericValue?: number }>;
        };
    };
    const categories = body.lighthouseResult?.categories ?? {};
    const audits = body.lighthouseResult?.audits ?? {};

    const scores = Object.fromEntries(
        CATEGORIES.map((category) => {
            const score = categories[category]?.score;
            return [category, typeof score === 'number' ? Math.round(score * 100) : null];
        }),
    ) as Scores;
    const metrics = Object.fromEntries(
        Object.entries(METRICS).map(([key, audit]) => {
            const value = audits[audit]?.numericValue;
            if (typeof value !== 'number') return [key, null];
            return [key, key === 'cls' ? Math.round(value * 1000) / 1000 : Math.round(value)];
        }),
    ) as Metrics;

    return { scores, metrics } satisfies Result;
};

/** Keeps a run's scores: one entry a day (the latest wins), the last {@link KEEP} days. */
export const saveScores = async (key: string, { scores, metrics }: Result, now = Date.now()) => {
    const date = new Date(now).toISOString().slice(0, 10);
    const entries = ((await lighthouse().get(key, { type: 'json' })) as Entry[] | null) ?? [];
    const next = [
        ...entries.filter((entry) => entry.date !== date),
        { date, at: now, scores, metrics },
    ]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-KEEP);
    await lighthouse().setJSON(key, next);
};

export type LighthouseSummary = {
    key: string;
    page: string;
    path: string;
    strategy: Strategy;
    latest: Entry | null;
    history: Entry[];
    /** When the dashboard may run this one again by hand; null if it may now. */
    manualAvailableAt: number | null;
}[];

/** Time between runs of one page and strategy from the dashboard: guards the PSI quota. */
export const COOLDOWN_MS = 10 * 60 * 1000;

const manualKey = (key: string) => `manual/${key}`;

const availableAt = async (key: string, now: number) => {
    const last = (await lighthouse().get(manualKey(key), { type: 'json' })) as number | null;
    return typeof last === 'number' && last + COOLDOWN_MS > now ? last + COOLDOWN_MS : null;
};

/** Every page and strategy's scores, latest and history. */
export const readScores = async (now = Date.now()): Promise<LighthouseSummary> =>
    Promise.all(
        COMBOS.map(async ({ page, strategy, key }) => {
            const history =
                ((await lighthouse().get(key, { type: 'json' })) as Entry[] | null) ?? [];
            return {
                key,
                page: page.name,
                path: page.path,
                strategy,
                latest: history.at(-1) ?? null,
                history,
                manualAvailableAt: await availableAt(key, now),
            };
        }),
    );

export type ManualRun =
    | { ok: true; result: Result }
    | { ok: false; status: 429; error: string; retryAt: number }
    | { ok: false; status: 502; error: string };

/** A failed run in words the dashboard can show. */
const explain = (error: unknown) => {
    if (error instanceof Error && error.message.endsWith(' 429')) {
        return 'PageSpeed Insights’ quota is used up for now. Setting PSI_API_KEY in Netlify gives this site a quota of its own.';
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
        return 'PageSpeed Insights took too long. Try again in a few minutes.';
    }
    return 'PageSpeed Insights couldn’t run. Try again in a few minutes.';
};

/**
 * Runs one page and strategy now, from the dashboard, and keeps the scores as today's (the
 * day's latest wins, as with the scheduled runs). At most once every {@link COOLDOWN_MS} for
 * each, counted from when it started, failed or not, so presses can't use up the quota.
 */
export const runManual = async (
    key: string,
    base: string,
    apiKey?: string,
    now = Date.now(),
): Promise<ManualRun> => {
    const combo = COMBOS.find((c) => c.key === key);
    if (!combo) throw new Error(`No Lighthouse run called ${key}`);

    const retryAt = await availableAt(key, now);
    if (retryAt !== null) {
        return { ok: false, status: 429, error: 'This one ran a few minutes ago.', retryAt };
    }
    await lighthouse().setJSON(manualKey(key), now);

    try {
        const result = await fetchScores(
            new URL(combo.page.path, base).toString(),
            combo.strategy,
            apiKey,
        );
        await saveScores(key, result, now);
        return { ok: true, result };
    } catch (error) {
        console.error(`Lighthouse ${key} (from the dashboard) failed:`, error);
        return { ok: false, status: 502, error: explain(error) };
    }
};
