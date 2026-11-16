import type { ContactFormData } from '../../../src/components/ui/organisms/ContactForm/types.ts';

const ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/** Escapes text for HTML, so what someone types can't add markup or links to the email. */
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ENTITIES[c]);

const field = (value: string | undefined) => escapeHtml(value || '—');

/** The email the studio receives for one enquiry. */
export const buildEnquiryEmail = (data: ContactFormData) => {
    const { name, company, email, phone, projectType, preferredContact, referral, message } = data;

    // Subjects are plain text; just keep them to one line.
    const subject = `New enquiry from ${name}${company ? ` — ${company}` : ''}`.replace(
        /\s+/g,
        ' ',
    );

    const html = `
      <p><strong>Name:</strong> ${field(name)}</p>
      <p><strong>Company:</strong> ${field(company)}</p>
      <p><strong>Email:</strong> ${field(email)}</p>
      <p><strong>Phone:</strong> ${field(phone)}</p>
      <p><strong>Project type:</strong> ${field(projectType)}</p>
      <p><strong>Preferred contact:</strong> ${field(preferredContact)}</p>
      <p><strong>How they heard:</strong> ${field(referral)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap">${field(message)}</p>
    `;

    return { subject, html };
};
