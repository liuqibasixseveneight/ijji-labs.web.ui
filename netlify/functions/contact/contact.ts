import type { Handler } from '@netlify/functions';

import { contactSchema } from '../../../src/components/ui/organisms/ContactForm/schema.ts';
import { deliver, json, readForm } from '../../shared/email.ts';
import { buildEnquiryEmail } from './enquiryEmail.ts';

/**
 * POST /.netlify/functions/contact: the contact form. Checks the enquiry against the same
 * schema as the form, since anyone can post here, then emails it to the studio.
 */
export const handler: Handler = async (event) => {
    const form = readForm(event, contactSchema);

    if (form.ok === 'bot') return json(200, { success: true });
    if (!form.ok) return form.response;

    return deliver({ ...buildEnquiryEmail(form.data), replyTo: form.data.email });
};
