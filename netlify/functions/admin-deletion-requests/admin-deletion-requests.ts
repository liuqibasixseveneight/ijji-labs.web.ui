import type { Config } from '@netlify/functions';

import { z } from '../../../src/lib/zod.ts';
import { json, withAdmin } from '../../shared/admin/http.ts';
import { changeStatus, listRequests, STATUSES } from '../../shared/deletionRequests.ts';

export const config: Config = { path: '/api/admin/deletion-requests' };

/** The one change the dashboard can make: a request's status, with an optional note. */
const changeSchema = z.object({
    id: z.uuid(),
    status: z.enum(STATUSES),
    note: z.string().trim().max(500).optional(),
});

/** The production project's SQL editor, where an account is deleted: from its URL's ref. */
export const sqlEditorUrl = (supabaseUrl: string) => {
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    return `https://supabase.com/dashboard/project/${ref}/sql/new`;
};

/**
 * /api/admin/deletion-requests
 * - GET: every web request to delete an app account, open ones first, and a link to the
 *   production project's SQL editor.
 * - POST `{ id, status, note? }`: moves one on. Nothing can be created, edited or deleted here.
 */
export default withAdmin(
    async (request, _session, env) => {
        if (request.method === 'GET') {
            return json(200, {
                requests: await listRequests(),
                now: Date.now(),
                sqlEditorUrl: sqlEditorUrl(env.supabaseUrl),
            });
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return json(400, { error: 'Invalid request.' });
        }

        const change = changeSchema.safeParse(body);
        if (!change.success) return json(400, { error: 'Invalid change.' });

        const { id, status, note } = change.data;
        const updated = await changeStatus(id, status, note || undefined);
        if (!updated) return json(404, { error: 'No such request.' });

        return json(200, { request: updated });
    },
    { methods: ['GET', 'POST'] },
);
