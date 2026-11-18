// What the dashboard has loaded, kept in memory for a minute so moving between pages is
// instant. Memory only (never localStorage): it's gone on reload or sign-out, so nothing about
// the site or its users is left in the browser.

/** How long loaded data is shown without asking again. */
export const FRESH_MS = 60_000;

type Entry<T> = {
    /** The last value that loaded, and when. */
    value?: T;
    at?: number;
    /** A load still going, shared by everyone who asks meanwhile. */
    pending?: Promise<T | null>;
};

const entries = new Map<string, Entry<unknown>>();

/**
 * What a page's loader hands its page: the data, now if it's fresh or still loading if not,
 * and the last value meanwhile (so the page can show it while it updates).
 */
export type Loaded<T> = {
    data: T | null | Promise<T | null>;
    stale: T | null;
    /** When `stale` (or `data`, when it's here) was loaded. */
    at: number | null;
};

const start = <T>(key: string, load: () => Promise<T | null>) => {
    const entry = (entries.get(key) ?? {}) as Entry<T>;
    if (!entry.pending) {
        entry.pending = load()
            .then((value) => {
                // Only real data is kept: a failed load (null) is asked for again next time.
                if (value !== null) {
                    entry.value = value;
                    entry.at = Date.now();
                }
                return value;
            })
            .finally(() => {
                entry.pending = undefined;
            });
        entries.set(key, entry);
    }
    return entry.pending;
};

/** Data for a page: fresh from memory, or loading (with the last value to show meanwhile). */
export const cached = <T>(key: string, load: () => Promise<T | null>): Loaded<T> => {
    const entry = entries.get(key) as Entry<T> | undefined;
    if (entry?.value !== undefined && entry.at !== undefined && Date.now() - entry.at < FRESH_MS) {
        return { data: entry.value, stale: null, at: entry.at };
    }
    return { data: start(key, load), stale: entry?.value ?? null, at: entry?.at ?? null };
};

/** Starts loading ahead of time (a link hovered), unless it's fresh or already loading. */
export const prefetch = <T>(key: string, load: () => Promise<T | null>) => {
    const entry = entries.get(key);
    if (entry?.at !== undefined && Date.now() - entry.at < FRESH_MS) return;
    void start(key, load);
};

/** Marks data as out of date (a refresh, a Lighthouse run), so the next load asks again. */
export const invalidate = (prefix = '') => {
    for (const [key, entry] of entries) if (key.startsWith(prefix)) entry.at = 0;
};

/** Forgets everything (sign-out, and between tests). */
export const clearCache = () => entries.clear();
