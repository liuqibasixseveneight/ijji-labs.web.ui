// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryBlobs } from './admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('./blobs.ts', () => ({ store: () => blobs.current!.store() }));

import {
    CHECKS,
    pruneRuns,
    readRuns,
    runChecks,
    saveRun,
    summarise,
    updateAlert,
    type Run,
} from './uptime.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 20, 12);
const BASE = 'https://ijji-labs.com';

const allOk = (at: number): Run => ({
    at,
    results: CHECKS.map((c) => ({ path: c.path, ok: true, status: c.expect, ms: 100 })),
});
const oneDown = (at: number): Run => ({
    at,
    results: CHECKS.map((c, i) => ({
        path: c.path,
        ok: i !== 2,
        status: i === 2 ? 500 : c.expect,
        ms: 200,
    })),
});

describe('uptime checks', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
    });
    afterEach(() => vi.unstubAllGlobals());

    it('cover the key pages, every store-listed app page and the contact function', () => {
        expect(CHECKS.map((c) => c.path)).toEqual([
            '/',
            '/contact',
            '/apps/ijji-tracker/privacy',
            '/apps/ijji-tracker/terms',
            '/apps/ijji-tracker/support',
            '/apps/ijji-tracker/delete-account',
            '/.netlify/functions/contact',
        ]);
        // A GET, refused with 405: no email sent, no form post counted.
        expect(CHECKS.at(-1)!.expect).toBe(405);
    });

    it('pass a page on the status it should give, and fail it otherwise', async () => {
        const fetch = vi.fn<(url: URL, init?: RequestInit) => Promise<Response>>(async (url) => {
            if (url.pathname === '/contact') return new Response('', { status: 503 });
            if (url.pathname.includes('terms')) throw new Error('timed out');
            return new Response('', { status: url.pathname.startsWith('/.netlify') ? 405 : 200 });
        });
        vi.stubGlobal('fetch', fetch);

        const run = await runChecks(BASE, NOW);

        expect(run.at).toBe(NOW);
        const byPath = Object.fromEntries(run.results.map((r) => [r.path, r]));
        expect(byPath['/']).toMatchObject({ ok: true, status: 200 });
        expect(byPath['/contact']).toMatchObject({ ok: false, status: 503 });
        expect(byPath['/apps/ijji-tracker/terms']).toMatchObject({ ok: false, status: 0 });
        expect(byPath['/.netlify/functions/contact']).toMatchObject({ ok: true, status: 405 });
        expect(fetch.mock.calls[0][0].toString()).toBe(`${BASE}/`);
        expect(fetch.mock.calls.every(([, init]) => !init?.method)).toBe(true);
    });

    it('keep a day’s runs together and read back the last week', async () => {
        await saveRun(allOk(NOW - 8 * DAY));
        await saveRun(allOk(NOW - DAY));
        await saveRun(oneDown(NOW));
        await saveRun(allOk(NOW + 60_000));

        const runs = await readRuns(7, NOW);
        expect(runs.map((r) => r.at)).toEqual([NOW - DAY, NOW, NOW + 60_000]);
    });

    it('email after two failed runs in a row, once, and again when it’s back', async () => {
        expect(await updateAlert(oneDown(NOW))).toBeNull();
        expect(await updateAlert(oneDown(NOW + 1))).toBe('down');
        expect(await updateAlert(oneDown(NOW + 2))).toBeNull();
        expect(await updateAlert(allOk(NOW + 3))).toBe('up');
        expect(await updateAlert(allOk(NOW + 4))).toBeNull();
        // One blip isn't worth an email.
        expect(await updateAlert(oneDown(NOW + 5))).toBeNull();
        expect(await updateAlert(allOk(NOW + 6))).toBeNull();
    });

    it('clear days older than 30', async () => {
        await saveRun(allOk(NOW - 31 * DAY));
        await saveRun(allOk(NOW - 29 * DAY));
        expect(await pruneRuns(NOW)).toBe(1);
        expect([...blobs.current!.data.keys()]).toEqual(['day/2026-10-22']);
    });

    it('sum up each page: now, uptime, speed and the recent strip', () => {
        const runs = [allOk(NOW - 3 * DAY), oneDown(NOW - 2 * 60_000), allOk(NOW)];
        const [, , privacy] = summarise(runs, NOW);

        expect(privacy).toMatchObject({
            name: 'IJJI Tracker privacy policy',
            latest: { ok: true },
            lastCheckedAt: NOW,
            uptime24h: 50,
            uptime7d: 66.7,
            averageMs24h: 150,
        });
        expect(privacy.recent.map((r) => r.ok)).toEqual([true, false, true]);
    });

    it('say nothing is known before the first run', () => {
        expect(summarise([], NOW)[0]).toMatchObject({
            latest: null,
            uptime24h: null,
            uptime7d: null,
            averageMs24h: null,
            recent: [],
        });
    });
});
