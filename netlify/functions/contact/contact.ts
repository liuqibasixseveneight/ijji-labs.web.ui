import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';

import { contactSchema } from '../../../src/components/ui/organisms/ContactForm/schema.ts';
import { buildEnquiryEmail } from './enquiryEmail.ts';

const json = (statusCode: number, body: object) => ({ statusCode, body: JSON.stringify(body) });

/**
 * POST /.netlify/functions/contact: the contact form. Checks the enquiry against the same
 * schema as the form, since anyone can post here, then emails it via Resend.
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body: unknown;
    try {
        body = JSON.parse(event.body ?? '{}');
    } catch {
        return json(400, { success: false, error: 'Invalid request.' });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
        return json(400, {
            success: false,
            error: 'Some details are missing or invalid — please check the form.',
        });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { subject, html } = buildEnquiryEmail(parsed.data);

        const { error } = await resend.emails.send({
            from: process.env.CONTACT_EMAIL_FROM!,
            to: process.env.CONTACT_EMAIL_TO!,
            replyTo: parsed.data.email,
            subject,
            html,
        });

        if (error) throw error;

        return json(200, { success: true });
    } catch (error) {
        console.error('Resend error:', error);
        return json(500, { success: false, error: 'Failed to send — please try again.' });
    }
};
