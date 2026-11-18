// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryBlobs } from './admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('./blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { COMBOS, fetchScores, KEEP, readScores, saveScores } from './lighthouse.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 20, 3);
const SCORES = { performance: 92, accessibility: 100, 'best-practices': 100, seo: 100 };
const METRICS = { fcp: 1800, lcp: 1800, tbt: 1180, cls: 0, si: 6300 };
const RESULT = { scores: SCORES, metrics: METRICS };

describe('Lighthouse scores', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
    });
    afterEach(() => vi.unstubAllGlobals());

    it('cover the home page and the privacy policy, on mobile and desktop', () => {
        expect(COMBOS.map((c) => c.key)).toEqual([
            'home-mobile',
            'home-desktop',
            'privacy-mobile',
            'privacy-desktop',
        ]);
    });

    it('are asked of PageSpeed Insights for all four categories, and given out of 100', async () => {
        const fetch = vi.fn(async () =>
            Response.json({
                lighthouseResult: {
                    categories: {
                        performance: { score: 0.917 },
                        accessibility: { score: 1 },
                        'best-practices': { score: null },
                    },
                    audits: {
                        'first-contentful-paint': { numericValue: 1812.4 },
                        'total-blocking-time': { numericValue: 1180.2 },
                        'cumulative-layout-shift': { numericValue: 0.00412 },
                    },
                },
            }),
        );
        vi.stubGlobal('fetch', fetch);

        expect(await fetchScores('https://ijji-labs.com/', 'mobile', 'KEY')).toEqual({
            scores: {
                performance: 92,
                accessibility: 100,
                'best-practices': null,
                seo: null,
            },
            metrics: { fcp: 1812, lcp: null, tbt: 1180, cls: 0.004, si: null },
        });

        const url = (fetch.mock.calls[0] as unknown as [URL])[0];
        expect(url.searchParams.get('url')).toBe('https://ijji-labs.com/');
        expect(url.searchParams.get('strategy')).toBe('mobile');
        expect(url.searchParams.getAll('category')).toEqual([
            'performance',
            'accessibility',
            'best-practices',
            'seo',
        ]);
        expect(url.searchParams.get('key')).toBe('KEY');
    });

    it('report a refusal from PageSpeed Insights', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('', { status: 429 })),
        );
        await expect(fetchScores('https://ijji-labs.com/', 'desktop')).rejects.toThrow('429');
    });

    it('keep one entry a day, the latest, for 30 days', async () => {
        for (let i = 35; i >= 0; i--) await saveScores('home-mobile', RESULT, NOW - i * DAY);
        await saveScores(
            'home-mobile',
            { scores: { ...SCORES, performance: 80 }, metrics: METRICS },
            NOW + 60_000,
        );

        const [home] = await readScores();
        expect(home.history).toHaveLength(KEEP);
        expect(home.latest).toMatchObject({
            date: '2026-11-20',
            scores: { performance: 80 },
            metrics: { tbt: 1180 },
        });
        expect(home).toMatchObject({ page: 'Home', path: '/', strategy: 'mobile' });
    });

    it('are empty before the first run', async () => {
        const rows = await readScores();
        expect(rows.every((r) => r.latest === null && r.history.length === 0)).toBe(true);
    });
});
