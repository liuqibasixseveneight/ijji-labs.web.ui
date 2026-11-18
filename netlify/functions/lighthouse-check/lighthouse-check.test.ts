// @vitest-environment node
import type { Context } from '@netlify/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryBlobs } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { countForm } from '../../shared/formStats.ts';
import { readScores } from '../../shared/lighthouse.ts';
import run, { comboFor, config } from './lighthouse-check.ts';

const context = { site: { url: 'https://ijji-labs.com' } } as Context;
const at = (minute: number) => new Date(Date.UTC(2026, 10, 20, 3, minute));

const psi = () =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
            Response.json({
                lighthouseResult: {
                    categories: {
                        performance: { score: 0.95 },
                        accessibility: { score: 1 },
                        'best-practices': { score: 1 },
                        seo: { score: 1 },
                    },
                },
            }),
        ),
    );

describe('the daily Lighthouse check', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        delete process.env.PSI_API_KEY;
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('runs four times each morning, one page and strategy each', () => {
        expect(config.schedule).toBe('0,15,30,45 3 * * *');
        expect([0, 15, 30, 45].map((m) => comboFor(at(m)).key)).toEqual([
            'home-mobile',
            'home-desktop',
            'privacy-mobile',
            'privacy-desktop',
        ]);
    });

    it('scores the live page and keeps it', async () => {
        vi.useFakeTimers({ now: at(30), toFake: ['Date'] });
        psi();
        await run(new Request('https://ijji-labs.com/'), context);

        const url = vi.mocked(fetch).mock.calls[0][0] as unknown as URL;
        expect(url.searchParams.get('url')).toBe('https://ijji-labs.com/apps/ijji-tracker/privacy');
        expect(url.searchParams.get('key')).toBeNull();

        const privacy = (await readScores()).find(
            (r) => r.path.endsWith('/privacy') && r.strategy === 'mobile',
        );
        expect(privacy!.latest!.scores.performance).toBe(95);
    });

    it('clears old form counts on the first run of the morning only', async () => {
        const old = Date.UTC(2026, 6, 1);
        await countForm('contact', 'sent', old);
        psi();

        vi.useFakeTimers({ now: at(15), toFake: ['Date'] });
        await run(new Request('https://ijji-labs.com/'), context);
        expect([...blobs.current!.data.keys()].some((k) => k.startsWith('contact/'))).toBe(true);

        vi.useFakeTimers({ now: at(0), toFake: ['Date'] });
        await run(new Request('https://ijji-labs.com/'), context);
        expect([...blobs.current!.data.keys()].some((k) => k.startsWith('contact/'))).toBe(false);
    });

    it('logs a failed run rather than throwing, so tomorrow tries again', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.useFakeTimers({ now: at(15), toFake: ['Date'] });
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('', { status: 500 })),
        );

        await expect(run(new Request('https://ijji-labs.com/'), context)).resolves.toBeUndefined();
        expect(console.error).toHaveBeenCalledWith(
            'Lighthouse home-desktop failed:',
            expect.anything(),
        );
    });
});
