import { apps } from '../../src/content/apps.ts';
import { paths } from '../../src/router/paths.ts';
import { store } from './blobs.ts';

// Uptime: the pages that matter most, checked every ten minutes by the uptime-check function.
// The store-listed app pages are here because App Store Connect and the Play Console link to
// them; if one goes down, the stores can flag the app.

export type Check = {
    name: string;
    path: string;
    /** The status that means it's working. */
    expect: number;
};

export const CHECKS: Check[] = [
    { name: 'Home', path: paths.home, expect: 200 },
    { name: 'Contact', path: paths.contact, expect: 200 },
    ...apps.flatMap((app) => {
        const to = paths.app(app.slug);
        return [
            { name: `${app.name} privacy policy`, path: to.privacy, expect: 200 },
            { name: `${app.name} terms`, path: to.terms, expect: 200 },
            { name: `${app.name} support`, path: to.support, expect: 200 },
            { name: `${app.name} delete account`, path: to.deleteAccount, expect: 200 },
        ];
    }),
    // A GET is refused with 405 without touching the form: proof the function runs, with
    // no email sent and nothing counted as a form post.
    { name: 'Contact form function', path: '/.netlify/functions/contact', expect: 405 },
];

export type Result = { path: string; ok: boolean; status: number; ms: number };
export type Run = { at: number; results: Result[] };

/** Slower than this counts as down. */
export const TIMEOUT_MS = 10_000;
/** Runs are kept this long. */
export const KEEP_DAYS = 30;
/** Failed runs in a row before an alert is emailed. */
export const ALERT_AFTER = 2;

const DAY = 24 * 60 * 60 * 1000;
const day = (at: number) => new Date(at).toISOString().slice(0, 10);

// Scheduled functions are Functions v2, so strong reads work.
const uptime = () => store('uptime');

/** Checks every page once against `base` (the live site). */
export const runChecks = async (base: string, now = Date.now()): Promise<Run> => {
    const results = await Promise.all(
        CHECKS.map(async (check): Promise<Result> => {
            const started = Date.now();
            try {
                const response = await fetch(new URL(check.path, base), {
                    headers: { 'User-Agent': 'ijji-labs-uptime' },
                    redirect: 'follow',
                    signal: AbortSignal.timeout(TIMEOUT_MS),
                });
                await response.body?.cancel();
                return {
                    path: check.path,
                    ok: response.status === check.expect,
                    status: response.status,
                    ms: Date.now() - started,
                };
            } catch {
                return { path: check.path, ok: false, status: 0, ms: Date.now() - started };
            }
        }),
    );
    return { at: now, results };
};

/** Adds a run to its day (one blob a day, written only by the scheduled check). */
export const saveRun = async (run: Run) => {
    const key = `day/${day(run.at)}`;
    const runs = ((await uptime().get(key, { type: 'json' })) as Run[] | null) ?? [];
    await uptime().setJSON(key, [...runs, run]);
};

/** The runs from the last `days` days, oldest first. */
export const readRuns = async (days = 7, now = Date.now()): Promise<Run[]> => {
    const keys = Array.from({ length: days }, (_, i) => `day/${day(now - (days - 1 - i) * DAY)}`);
    const all = await Promise.all(
        keys.map(
            async (key) => ((await uptime().get(key, { type: 'json' })) as Run[] | null) ?? [],
        ),
    );
    return all.flat();
};

type AlertState = { failing: number; alerted: boolean };

/**
 * Notes whether this run had a failure, and says when to email: once failures reach
 * {@link ALERT_AFTER} in a row ('down'), and once it's all fine again after that ('up').
 */
export const updateAlert = async (run: Run): Promise<'down' | 'up' | null> => {
    const state = ((await uptime().get('alert', { type: 'json' })) as AlertState | null) ?? {
        failing: 0,
        alerted: false,
    };
    const failed = run.results.some((result) => !result.ok);

    let next: AlertState;
    let send: 'down' | 'up' | null = null;
    if (failed) {
        next = { failing: state.failing + 1, alerted: state.alerted };
        if (!state.alerted && next.failing >= ALERT_AFTER) {
            next.alerted = true;
            send = 'down';
        }
    } else {
        next = { failing: 0, alerted: false };
        if (state.alerted) send = 'up';
    }

    await uptime().setJSON('alert', next);
    return send;
};

/** Deletes days older than {@link KEEP_DAYS}. */
export const pruneRuns = async (now = Date.now()) => {
    const cutoff = `day/${day(now - KEEP_DAYS * DAY)}`;
    const { blobs } = await uptime().list({ prefix: 'day/' });
    const old = blobs.filter(({ key }) => key < cutoff);
    await Promise.all(old.map(({ key }) => uptime().delete(key)));
    return old.length;
};

export type CheckSummary = {
    name: string;
    path: string;
    /** The latest result, or null before the first run. */
    latest: Result | null;
    lastCheckedAt: number | null;
    /** Share of runs that passed, as a percentage, or null with no runs. */
    uptime24h: number | null;
    uptime7d: number | null;
    /** Average response time over 24 hours, in ms. */
    averageMs24h: number | null;
    /** The last 48 runs (8 hours), oldest first: passed or not, and how long it took. */
    recent: { at: number; ok: boolean; ms: number }[];
};

const percent = (results: Result[]) =>
    results.length
        ? Math.round((results.filter((r) => r.ok).length / results.length) * 1000) / 10
        : null;

/** Each check's status and history, from the last week of runs. */
export const summarise = (runs: Run[], now = Date.now()): CheckSummary[] =>
    CHECKS.map((check) => {
        const mine = runs
            .map((run) => ({ at: run.at, result: run.results.find((r) => r.path === check.path) }))
            .filter((x): x is { at: number; result: Result } => x.result !== undefined);
        const day1 = mine.filter((x) => now - x.at <= DAY).map((x) => x.result);
        const last = mine.at(-1);

        return {
            name: check.name,
            path: check.path,
            latest: last?.result ?? null,
            lastCheckedAt: last?.at ?? null,
            uptime24h: percent(day1),
            uptime7d: percent(mine.map((x) => x.result)),
            averageMs24h: day1.length
                ? Math.round(day1.reduce((sum, r) => sum + r.ms, 0) / day1.length)
                : null,
            recent: mine.slice(-48).map((x) => ({ at: x.at, ok: x.result.ok, ms: x.result.ms })),
        };
    });
