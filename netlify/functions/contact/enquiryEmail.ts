import type { ContactFormData } from '../../../src/components/ui/organisms/ContactForm/types.ts';
import { field, oneLine } from '../../shared/email.ts';

/** The email the studio receives for one enquiry. */
export const buildEnquiryEmail = (data: ContactFormData) => {
    const { name, company, email, phone, projectType, preferredContact, referral, message } = data;

    const subject = oneLine(
        `${projectType === 'Help with IJJI Tracker' ? 'Support request' : 'New enquiry'} from ${name}${company ? ` — ${company}` : ''}`,
    );

    const html = `
      <p><strong>Name:</strong> ${field(name)}</p>
      <p><strong>Company:</strong> ${field(company)}</p>
      <p><strong>Email:</strong> ${field(email)}</p>
      <p><strong>Phone:</strong> ${field(phone)}</p>
      <p><strong>About:</strong> ${field(projectType)}</p>
      <p><strong>Preferred contact:</strong> ${field(preferredContact)}</p>
      <p><strong>How they heard:</strong> ${field(referral)}</p>
      <hr />
      <p><strong>Message:</strong><br /><span style="white-space: pre-wrap">${field(message)}</span></p>
    `;

    return { subject, html };
};
