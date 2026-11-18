import type { Handler } from '@netlify/functions';

import { findApp } from '../../../src/content/apps.ts';
import { deletionRequestSchema } from '../../../src/components/ui/organisms/DeletionRequestForm/schema.ts';
import { connectBlobs } from '../../shared/blobs.ts';
import { saveRequest } from '../../shared/deletionRequests.ts';
import { deliver, json, readForm } from '../../shared/email.ts';
import { countForm } from '../../shared/formStats.ts';
import { buildDeletionEmail } from './deletionEmail.ts';

/**
 * POST /.netlify/functions/account-deletion: a request to delete an app account, from
 * /apps/<slug>/delete-account. It only emails the studio; nothing is sent to the address
 * typed in, so the form can't be used to send mail to anyone. We confirm by replying.
 *
 * Each request is also saved for the admin dashboard's queue first, so it can't be missed.
 * If saving fails, the email still goes, marked NOT LOGGED.
 */
export const handler: Handler = async (event) => {
    connectBlobs(event);
    const form = readForm(event, deletionRequestSchema);

    if (form.ok === 'bot') {
        await countForm('account-deletion', 'bot');
        return json(200, { success: true });
    }
    if (!form.ok) {
        if (form.response.statusCode === 400) await countForm('account-deletion', 'invalid');
        return form.response;
    }

    const app = findApp(form.data.app);
    if (!app) {
        await countForm('account-deletion', 'invalid');
        return json(400, { success: false, error: 'We don’t recognise that app.' });
    }

    let logged = true;
    try {
        await saveRequest({
            app: app.slug,
            appName: app.name,
            email: form.data.email,
            reason: form.data.reason,
        });
    } catch (error) {
        console.error('Deletion request not saved:', error);
        logged = false;
    }

    const result = await deliver({
        ...buildDeletionEmail(form.data, app.name, { logged }),
        replyTo: form.data.email,
    });
    await countForm('account-deletion', result.statusCode === 200 ? 'sent' : 'failed');
    return result;
};
