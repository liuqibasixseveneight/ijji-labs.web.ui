// @vitest-environment node
import type { HandlerContext, HandlerEvent } from '@netlify/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

import { handler } from './contact.ts';
import { escapeHtml } from '../../shared/email.ts';
import { buildEnquiryEmail } from './enquiryEmail.ts';

const valid = {
    name: 'Jane Smith',
    company: 'Smith & Co',
    email: 'jane@example.com',
    phone: '+44 113 496 0000',
    projectType: 'New website project',
    message: 'We would like a new website.',
};

const call = async (body: unknown, httpMethod = 'POST') => {
    const event = {
        httpMethod,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    } as HandlerEvent;
    const result = await handler(event, {} as HandlerContext);
    return result as { statusCode: number; body: string };
};

describe('the contact function', () => {
    beforeEach(() => {
        send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null });
        process.env.CONTACT_EMAIL_FROM = 'site@example.com';
        process.env.CONTACT_EMAIL_TO = 'hello@example.com';
    });

    it('only takes POST', async () => {
        expect((await call(valid, 'GET')).statusCode).toBe(405);
        expect(send).not.toHaveBeenCalled();
    });

    it('emails a valid enquiry, replying to the sender', async () => {
        const result = await call(valid);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ success: true });
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'site@example.com',
                to: 'hello@example.com',
                replyTo: 'jane@example.com',
                subject: 'New enquiry from Jane Smith — Smith & Co',
            }),
        );
    });

    it.each([
        ['a body that is not JSON', '{nope'],
        ['a missing email', { ...valid, email: '' }],
        ['an unknown project type', { ...valid, projectType: 'Crypto' }],
        ['a message over 2000 characters', { ...valid, message: 'x'.repeat(2001) }],
    ])('refuses %s without sending', async (_, body) => {
        const result = await call(body);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).success).toBe(false);
        expect(send).not.toHaveBeenCalled();
    });

    it('quietly drops a bot that fills the hidden field', async () => {
        const result = await call({ ...valid, website: 'http://spam.example' });

        expect(result.statusCode).toBe(200);
        expect(send).not.toHaveBeenCalled();
    });

    it('takes a support request without a phone number, marked as support', async () => {
        const result = await call({ ...valid, phone: '', projectType: 'Help with IJJI Tracker' });

        expect(result.statusCode).toBe(200);
        expect(send.mock.calls[0][0].subject).toBe('Support request from Jane Smith — Smith & Co');
    });

    it('still needs a phone number for a project', async () => {
        expect((await call({ ...valid, phone: '' })).statusCode).toBe(400);
    });

    it('reports a failure when Resend returns an error', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        send.mockResolvedValue({ data: null, error: { message: 'Invalid from address' } });

        const result = await call(valid);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Failed to send — please try again.');
    });
});

describe('the enquiry email', () => {
    it('escapes what was typed, so it cannot add markup or links', () => {
        const { html } = buildEnquiryEmail({
            ...valid,
            projectType: 'Other',
            message: '<a href="https://evil.example">Click</a> & "quote"',
        });

        expect(html).not.toContain('<a href');
        expect(html).toContain(
            '&lt;a href=&quot;https://evil.example&quot;&gt;Click&lt;/a&gt; &amp;',
        );
    });

    it('shows a dash for fields left empty', () => {
        const { html } = buildEnquiryEmail({ ...valid, projectType: 'Other', company: '' });

        expect(html).toContain('<strong>Company:</strong> —');
    });

    it('keeps the message with its label, in one paragraph', () => {
        const { html } = buildEnquiryEmail({ ...valid, projectType: 'New website project' });

        expect(html).toContain(
            '<p><strong>Message:</strong><br /><span style="white-space: pre-wrap">We would like a new website.</span></p>',
        );
    });

    it('keeps the subject on one line', () => {
        const { subject } = buildEnquiryEmail({
            ...valid,
            projectType: 'Other',
            name: 'Jane\nBcc: someone',
            company: undefined,
        });

        expect(subject).toBe('New enquiry from Jane Bcc: someone');
    });

    it('escapeHtml leaves plain text alone', () => {
        expect(escapeHtml('Hello there')).toBe('Hello there');
        expect(escapeHtml(`<'&'>`)).toBe('&lt;&#39;&amp;&#39;&gt;');
    });
});
