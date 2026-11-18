// @vitest-environment node
import type { Context } from '@netlify/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV, memoryBlobs } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

import { readRuns } from '../../shared/uptime.ts';
import run, { config } from './uptime-check.ts';

const context = { site: { url: 'https://ijji-labs.com' } } as Context;

/** A pretend live site: every page up, or `down` answering 500. */
const site = (down: string[] = []) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: URL) => {
            if (down.includes(url.pathname)) return new Response('', { status: 500 });
            return new Response('', { status: url.pathname.startsWith('/.netlify') ? 405 : 200 });
        }),
    );

describe('the uptime check', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null });
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('runs every 10 minutes', () => {
        expect(config.schedule).toBe('*/10 * * * *');
    });

    it('checks the live site and keeps the run for the dashboard', async () => {
        site();
        await run(new Request('https://ijji-labs.com/'), context);

        const [saved] = await readRuns(1);
        expect(saved.results.every((r) => r.ok)).toBe(true);
        expect(send).not.toHaveBeenCalled();
    });

    it('emails once after two failed runs in a row, and again when it’s back', async () => {
        site(['/apps/ijji-tracker/privacy']);
        await run(new Request('https://ijji-labs.com/'), context);
        expect(send).not.toHaveBeenCalled();

        await run(new Request('https://ijji-labs.com/'), context);
        expect(send).toHaveBeenCalledOnce();
        const down = send.mock.calls[0][0];
        expect(down.to).toBe(ENV.CONTACT_EMAIL_TO);
        expect(down.subject).toBe('Site check failing: IJJI Tracker privacy policy');
        expect(down.html).toContain('status 500');
        expect(down.html).toContain('https://ijji-labs.com/admin/website');

        await run(new Request('https://ijji-labs.com/'), context);
        expect(send).toHaveBeenCalledOnce();

        site();
        await run(new Request('https://ijji-labs.com/'), context);
        expect(send).toHaveBeenCalledTimes(2);
        expect(send.mock.calls[1][0].subject).toBe('Site checks passing again');
    });

    it('still keeps the run if the alert email fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        send.mockResolvedValue({ data: null, error: { message: 'down' } });
        site(['/']);
        await run(new Request('https://ijji-labs.com/'), context);
        await run(new Request('https://ijji-labs.com/'), context);

        expect(await readRuns(1)).toHaveLength(2);
        expect(console.error).toHaveBeenCalledWith('Uptime alert not sent:', expect.anything());
    });
});
