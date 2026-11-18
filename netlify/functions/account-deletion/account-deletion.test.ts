// @vitest-environment node
import type { HandlerContext, HandlerEvent } from '@netlify/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

const blobs = vi.hoisted(() => ({
    current: null as null | ReturnType<typeof import('../../shared/admin/testing.ts').memoryBlobs>,
    failing: false,
}));
vi.mock('../../shared/blobs.ts', () => ({
    connectBlobs: () => {},
    store: () => {
        if (blobs.failing) throw new Error('Blobs is down');
        return blobs.current!.store();
    },
}));

import { memoryBlobs } from '../../shared/admin/testing.ts';
import { listRequests } from '../../shared/deletionRequests.ts';
import { readFormStats } from '../../shared/formStats.ts';
import { handler } from './account-deletion.ts';

const valid = { app: 'ijji-tracker', email: 'me@example.com', reason: '', confirm: true };

const call = async (body: unknown, httpMethod = 'POST') => {
    const event = {
        httpMethod,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    } as HandlerEvent;
    return (await handler(event, {} as HandlerContext)) as { statusCode: number; body: string };
};

describe('the account-deletion function', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        blobs.failing = false;
        send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null });
        process.env.CONTACT_EMAIL_FROM = 'site@example.com';
        process.env.CONTACT_EMAIL_TO = 'support@example.com';
    });

    it('only takes POST', async () => {
        expect((await call(valid, 'GET')).statusCode).toBe(405);
    });

    it('emails the studio, never the address typed in, with what to do next', async () => {
        const result = await call({ ...valid, reason: '<b>bye</b>' });

        expect(result.statusCode).toBe(200);
        expect(send).toHaveBeenCalledOnce();

        const message = send.mock.calls[0][0];
        expect(message.to).toBe('support@example.com');
        expect(message.replyTo).toBe('me@example.com');
        expect(message.subject).toBe('Account deletion request: IJJI Tracker — me@example.com');
        // The reason sits on its label's line, like every other field.
        expect(message.html).toContain(
            '<p><strong>Reason:</strong> <span style="white-space: pre-wrap">&lt;b&gt;bye&lt;/b&gt;</span></p>',
        );
        expect(message.html).toContain('reply from support@ijji-labs.com to confirm');
    });

    it.each([
        ['no confirmation', { ...valid, confirm: false }],
        ['a missing email', { ...valid, email: '' }],
        ['a slug with odd characters', { ...valid, app: '../etc' }],
        ['a very long reason', { ...valid, reason: 'x'.repeat(501) }],
    ])('refuses %s without sending', async (_, body) => {
        const result = await call(body);

        expect(result.statusCode).toBe(400);
        expect(send).not.toHaveBeenCalled();
    });

    it('refuses an app we don’t make', async () => {
        const result = await call({ ...valid, app: 'not-ours' });

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toBe('We don’t recognise that app.');
        expect(send).not.toHaveBeenCalled();
    });

    it('quietly drops a bot that fills the hidden field', async () => {
        const result = await call({ ...valid, website: 'http://spam.example' });

        expect(result.statusCode).toBe(200);
        expect(send).not.toHaveBeenCalled();
    });

    it('reports a failure when Resend returns an error', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        send.mockResolvedValue({ data: null, error: { message: 'down' } });

        expect((await call(valid)).statusCode).toBe(500);
    });

    it('saves the request for the admin dashboard, then emails the studio', async () => {
        expect((await call({ ...valid, reason: 'Moving on' })).statusCode).toBe(200);

        const [saved] = await listRequests();
        expect(saved).toMatchObject({
            app: 'ijji-tracker',
            appName: 'IJJI Tracker',
            email: 'me@example.com',
            reason: 'Moving on',
            status: 'new',
        });
        expect(saved.dueAt - saved.receivedAt).toBe(30 * 24 * 60 * 60 * 1000);
        expect(send.mock.calls[0][0].subject).not.toContain('NOT LOGGED');
        expect(send.mock.calls[0][0].html).toContain('/admin/deletion-requests');
    });

    it('still emails, marked NOT LOGGED, when the request can’t be saved', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        blobs.failing = true;

        expect((await call(valid)).statusCode).toBe(200);
        const message = send.mock.calls[0][0];
        expect(message.subject).toBe(
            'NOT LOGGED — Account deletion request: IJJI Tracker — me@example.com',
        );
        expect(message.html).toContain("isn't in the admin dashboard");
    });

    it('counts how each post went, for the dashboard', async () => {
        await call(valid);
        await call({ ...valid, app: 'not-ours' });
        await call({ ...valid, confirm: false });
        await call({ ...valid, website: 'http://spam.example' });

        const { total } = (await readFormStats()).forms['account-deletion'];
        expect(total).toEqual({ sent: 1, invalid: 2, bot: 1, failed: 0 });
    });

    it('saves nothing for bots or invalid posts', async () => {
        await call({ ...valid, website: 'http://spam.example' });
        await call({ ...valid, confirm: false });
        await call({ ...valid, app: 'not-ours' });
        expect(await listRequests()).toEqual([]);
    });
});
