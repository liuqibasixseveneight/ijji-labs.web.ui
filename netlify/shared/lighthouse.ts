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
export type Entry = { date: string; at: number; scores: Scores };

/** The four runs, in the order the morning's runs take them. */
export const COMBOS = PAGES.flatMap((page) =>
    STRATEGIES.map((strategy) => ({ page, strategy, key: `${page.id}-${strategy}` })),
);

/** Days of scores kept for each page and strategy. */
export const KEEP = 30;

const lighthouse = () => store('lighthouse');

/** Runs PageSpeed Insights on one page; its scores out of 100, or null if a category's missing. */
export const fetchScores = async (url: string, strategy: Strategy, apiKey?: string) => {
    const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    api.searchParams.set('url', url);
    api.searchParams.set('strategy', strategy);
    for (const category of CATEGORIES) api.searchParams.append('category', category);
    if (apiKey) api.searchParams.set('key', apiKey);

    const response = await fetch(api, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`PageSpeed Insights answered ${response.status}`);

    const body = (await response.json()) as {
        lighthouseResult?: { categories?: Record<string, { score: number | null }> };
    };
    const categories = body.lighthouseResult?.categories ?? {};
    return Object.fromEntries(
        CATEGORIES.map((category) => {
            const score = categories[category]?.score;
            return [category, typeof score === 'number' ? Math.round(score * 100) : null];
        }),
    ) as Scores;
};

/** Keeps a run's scores: one entry a day (the latest wins), the last {@link KEEP} days. */
export const saveScores = async (key: string, scores: Scores, now = Date.now()) => {
    const date = new Date(now).toISOString().slice(0, 10);
    const entries = ((await lighthouse().get(key, { type: 'json' })) as Entry[] | null) ?? [];
    const next = [...entries.filter((entry) => entry.date !== date), { date, at: now, scores }]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-KEEP);
    await lighthouse().setJSON(key, next);
};

export type LighthouseSummary = {
    page: string;
    path: string;
    strategy: Strategy;
    latest: Entry | null;
    history: Entry[];
}[];

/** Every page and strategy's scores, latest and history. */
export const readScores = async (): Promise<LighthouseSummary> =>
    Promise.all(
        COMBOS.map(async ({ page, strategy, key }) => {
            const history =
                ((await lighthouse().get(key, { type: 'json' })) as Entry[] | null) ?? [];
            return {
                page: page.name,
                path: page.path,
                strategy,
                latest: history.at(-1) ?? null,
                history,
            };
        }),
    );
