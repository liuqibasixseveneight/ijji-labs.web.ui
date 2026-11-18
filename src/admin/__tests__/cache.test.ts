import { afterEach, describe, expect, it, vi } from 'vitest';

import { cached, clearCache, FRESH_MS, invalidate, prefetch } from '../cache.ts';

describe('the dashboard’s cache', () => {
    afterEach(() => {
        vi.useRealTimers();
        clearCache();
    });

    it('loads the first time, then hands over the same data at once for a minute', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        const load = vi.fn(async () => ({ n: 1 }));

        const first = cached('k', load);
        expect(first.data).toBeInstanceOf(Promise);
        expect(first.stale).toBeNull();
        expect(await first.data).toEqual({ n: 1 });

        const second = cached('k', load);
        expect(second.data).toEqual({ n: 1 });
        expect(load).toHaveBeenCalledTimes(1);

        // After a minute it loads again, with the last data to show meanwhile.
        vi.setSystemTime(Date.now() + FRESH_MS);
        load.mockResolvedValueOnce({ n: 2 });
        const third = cached('k', load);
        expect(third.stale).toEqual({ n: 1 });
        expect(await third.data).toEqual({ n: 2 });
    });

    it('shares one load between everyone who asks meanwhile, a hover included', async () => {
        let finish!: (value: { n: number }) => void;
        const load = vi.fn(() => new Promise<{ n: number }>((resolve) => (finish = resolve)));

        prefetch('k', load);
        const page = cached('k', load);
        expect(load).toHaveBeenCalledTimes(1);

        finish({ n: 1 });
        expect(await page.data).toEqual({ n: 1 });
        // Fresh now, so another hover asks nothing.
        prefetch('k', load);
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('doesn’t keep a failed load, so the next visit asks again', async () => {
        const load = vi.fn(async () => null);
        expect(await cached('k', load).data).toBeNull();
        await cached('k', load).data;
        expect(load).toHaveBeenCalledTimes(2);
    });

    it('loads again after a refresh, showing the last data meanwhile', async () => {
        const load = vi.fn(async () => ({ n: 1 }));
        await cached('website', load).data;
        await cached('supabase:prod', load).data;

        invalidate('website');
        const website = cached('website', load);
        expect(website.data).toBeInstanceOf(Promise);
        expect(website.stale).toEqual({ n: 1 });
        // Only what was refreshed.
        expect(cached('supabase:prod', load).data).toEqual({ n: 1 });
    });
});
