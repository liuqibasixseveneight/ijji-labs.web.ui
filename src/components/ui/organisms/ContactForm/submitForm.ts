import type { ContactFormData, SubmitResult } from './types.ts';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY); // TODO: Migrate to server

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
            from: 'Contact Form <onboarding@resend.dev>', // TODO: change to your email
            to: import.meta.env.VITE_CONTACT_EMAIL_TO,
            replyTo: data.email,
            subject,
            html: htmlBody,
        });

        return { success: true };
    } catch (error) {
        console.error('Resend error:', error);
        return { success: false, error: 'Failed to send — please try again or email us directly.' };
    }
};
