import type { ContactFormData, SubmitResult } from './types.ts';

export const submitContactForm = async (data: ContactFormData): Promise<SubmitResult> => {
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Contact Form <noreply@yourdomain.com>',
                to: import.meta.env.VITE_CONTACT_EMAIL_TO,
                reply_to: data.email,
                subject: `New enquiry from ${data.name}${data.company ? ` — ${data.company}` : ''}`,
                text: [
                    `Name:               ${data.name}`,
                    `Company:            ${data.company || '—'}`,
                    `Email:              ${data.email}`,
                    `Phone:              ${data.phone}`,
                    `Project type:       ${data.projectType}`,
                    `Preferred contact:  ${data.preferredContact || '—'}`,
                    `How they heard:     ${data.referral || '—'}`,
                    '',
                    'Message:',
                    data.message,
                ].join('\n'),
            }),
        });

        if (!res.ok) {
            console.error('Resend error:', await res.json().catch(() => ({})));
            return {
                success: false,
                error: 'Failed to send — please try again or email us directly.',
            };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Something went wrong. Please try again shortly.' };
    }
};
