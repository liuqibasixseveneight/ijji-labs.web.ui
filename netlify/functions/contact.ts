import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body ?? '{}');
        const { name, company, email, phone, projectType, preferredContact, referral, message } =
            data;

        const subject = `New enquiry from ${name}${company ? ` — ${company}` : ''}`;

        const htmlBody = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company || '—'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Project type:</strong> ${projectType}</p>
      <p><strong>Preferred contact:</strong> ${preferredContact || '—'}</p>
      <p><strong>How they heard:</strong> ${referral || '—'}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

        await resend.emails.send({
            from: process.env.CONTACT_EMAIL_FROM!,
            to: process.env.CONTACT_EMAIL_TO!,
            replyTo: email,
            subject,
            html: htmlBody,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Resend error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'Failed to send — please try again.' }),
        };
    }
};
