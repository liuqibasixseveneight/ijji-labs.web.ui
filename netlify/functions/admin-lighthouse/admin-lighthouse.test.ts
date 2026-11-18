// @vitest-environment node
import type { Context } from '@netlify/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRequest, ENV, memoryBlobs, sessionFor } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { COOLDOWN_MS, readScores } from '../../shared/lighthouse.ts';
import handler from './admin-lighthouse.ts';

const NOW = Date.UTC(2026, 10, 20, 14);
const context = { site: { url: 'https://www.ijji-labs.com' } } as Context;

const psi = (response: () => Response) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => response()),
    );
const scores = () =>
    Response.json({
        lighthouseResult: {
            categories: {
                performance: { score: 0.97 },
                accessibility: { score: 1 },
                'best-practices': { score: 1 },
                seo: { score: 1 },
            },
            audits: { 'total-blocking-time': { numericValue: 40 } },
        },
    });

const run = async (body: unknown) =>
    handler(
        adminRequest('/api/admin/lighthouse', {
            method: 'POST',
            cookie: await sessionFor(),
            body,
        }),
        context,
    );

describe('running Lighthouse from the dashboard', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        delete process.env.PSI_API_KEY;
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('runs one page and strategy against this site, and keeps it as today’s', async () => {
        psi(scores);
        const response = await run({ key: 'privacy-desktop' });

        expect(response.status).toBe(200);
        const url = vi.mocked(fetch).mock.calls[0][0] as unknown as URL;
        expect(url.searchParams.get('url')).toBe(
            'https://www.ijji-labs.com/apps/ijji-tracker/privacy',
        );
        expect(url.searchParams.get('strategy')).toBe('desktop');

        const row = (await readScores()).find((r) => r.key === 'privacy-desktop')!;
        expect(row.latest).toMatchObject({
            date: '2026-11-20',
            scores: { performance: 97 },
            metrics: { tbt: 40 },
        });
        expect(row.manualAvailableAt).toBe(NOW + COOLDOWN_MS);
    });

    it('runs only the four it knows, never an address it’s sent', async () => {
        psi(scores);
        for (const body of [{ key: 'https://evil.example' }, { key: 'home' }, {}, 'nonsense']) {
            expect((await run(body)).status).toBe(400);
        }
        expect(fetch).not.toHaveBeenCalled();
    });

    it('won’t run the same one again for 10 minutes, even after a failure', async () => {
        psi(() => new Response('', { status: 500 }));
        expect((await run({ key: 'home-mobile' })).status).toBe(502);

        const again = await run({ key: 'home-mobile' });
        expect(again.status).toBe(429);
        expect(await again.json()).toMatchObject({ retryAt: NOW + COOLDOWN_MS });
        expect(fetch).toHaveBeenCalledTimes(1);

        // Others aren't held up, and it can run again once the 10 minutes are up.
        psi(scores);
        expect((await run({ key: 'home-desktop' })).status).toBe(200);
        vi.setSystemTime(NOW + COOLDOWN_MS);
        expect((await run({ key: 'home-mobile' })).status).toBe(200);
    });

    it('says plainly when PageSpeed’s quota is used up', async () => {
        psi(() => new Response('', { status: 429 }));
        const response = await run({ key: 'home-mobile' });

        expect(response.status).toBe(502);
        expect((await response.json()).error).toMatch(/quota is used up.*PSI_API_KEY/);
    });
});
