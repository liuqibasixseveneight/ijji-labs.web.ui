import type { Handler } from '@netlify/functions';

import { contactSchema } from '../../../src/components/ui/organisms/ContactForm/schema.ts';
import { connectBlobs } from '../../shared/blobs.ts';
import { deliver, json, readForm } from '../../shared/email.ts';
import { countForm } from '../../shared/formStats.ts';
import { buildEnquiryEmail } from './enquiryEmail.ts';

/**
 * POST /.netlify/functions/contact: the contact form. Checks the enquiry against the same
 * schema as the form, since anyone can post here, then emails it to the studio. Each post
 * is counted for the admin dashboard (how it went, never who sent it).
 */
export const handler: Handler = async (event) => {
    connectBlobs(event);
    const form = readForm(event, contactSchema);

    if (form.ok === 'bot') {
        await countForm('contact', 'bot');
        return json(200, { success: true });
    }
    if (!form.ok) {
        if (form.response.statusCode === 400) await countForm('contact', 'invalid');
        return form.response;
    }

    const result = await deliver({ ...buildEnquiryEmail(form.data), replyTo: form.data.email });
    await countForm('contact', result.statusCode === 200 ? 'sent' : 'failed');
    return result;
};
