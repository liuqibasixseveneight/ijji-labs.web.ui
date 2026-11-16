// @vitest-environment node
import type { HandlerContext, HandlerEvent } from '@netlify/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

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
});
