import type { ContactFormData, SubmitResult } from './types.ts';
import { Resend } from 'resend';

import { RESEND_API_KEY, CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO } from '../../../../config.ts';

const resend = new Resend(RESEND_API_KEY);

if (!CONTACT_EMAIL_FROM || !CONTACT_EMAIL_TO) {
    throw new Error(
        '[Contact Form] Missing required email environment variables: CONTACT_EMAIL_FROM or CONTACT_EMAIL_TO. ' +
            'Please ensure they are set in your environment.',
    );
}

const fromEmail: string = CONTACT_EMAIL_FROM;
const toEmail: string = CONTACT_EMAIL_TO;

export const submitContactForm = async (data: ContactFormData): Promise<SubmitResult> => {
    try {
        const subject = `New enquiry from ${data.name}${data.company ? ` — ${data.company}` : ''}`;

        const htmlBody = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Company:</strong> ${data.company || '—'}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Project type:</strong> ${data.projectType}</p>
      <p><strong>Preferred contact:</strong> ${data.preferredContact || '—'}</p>
      <p><strong>How they heard:</strong> ${data.referral || '—'}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `;

        await resend.emails.send({
            from: `Contact Form <${fromEmail}>`,
            to: toEmail,
            replyTo: data.email,
            subject,
            html: htmlBody,
        });

        return { success: true };
    } catch (error) {
        console.error('Resend error:', error);
        return {
            success: false,
            error: 'Failed to send — please try again or email us directly.',
        };
    }
};
