// Shared by the site's Netlify functions. It lives outside netlify/functions/ because every
// top-level file there deploys as a function of its own.
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { Resend } from 'resend';
import type { ZodType } from 'zod';

const ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/** Escapes text for HTML, so what someone types can't add markup or links to an email. */
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** A form value for an email body: escaped, with a dash when it was left empty. */
export const field = (value: string | undefined) => escapeHtml(value || '—');

/** Email subjects are plain text; keep what someone typed to one line. */
export const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim();

export const json = (statusCode: number, body: object): HandlerResponse => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

export const INVALID = 'Some details are missing or invalid — please check the form.';
export const FAILED = 'Failed to send — please try again.';

type Parsed<T> = { ok: true; data: T } | { ok: false; response: HandlerResponse };

/**
 * Reads a form post: POST only, JSON, valid against `schema`. Bots that fill the hidden
 * `website` field get a quiet success and nothing is sent.
 */
export const readForm = <T extends { website?: string }>(
    event: HandlerEvent,
    schema: ZodType<T>,
): Parsed<T> | { ok: 'bot' } => {
    if (event.httpMethod !== 'POST') {
        return { ok: false, response: { statusCode: 405, body: 'Method Not Allowed' } };
    }

    let body: unknown;
    try {
        body = JSON.parse(event.body ?? '{}');
    } catch {
        return { ok: false, response: json(400, { success: false, error: 'Invalid request.' }) };
    }

    if (body && typeof body === 'object' && 'website' in body && body.website) {
        return { ok: 'bot' };
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return { ok: false, response: json(400, { success: false, error: INVALID }) };
    }

    return { ok: true, data: parsed.data };
};

/** Emails the studio inbox, with replies going to `replyTo`. */
export const sendToStudio = async (message: { subject: string; html: string; replyTo: string }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: process.env.CONTACT_EMAIL_FROM!,
        to: process.env.CONTACT_EMAIL_TO!,
        ...message,
    });

    if (error) throw error;
};

/** Sends, and turns the outcome into the response the form expects. */
export const deliver = async (message: Parameters<typeof sendToStudio>[0]) => {
    try {
        await sendToStudio(message);
        return json(200, { success: true });
    } catch (error) {
        console.error('Resend error:', error);
        return json(500, { success: false, error: FAILED });
    }
};
