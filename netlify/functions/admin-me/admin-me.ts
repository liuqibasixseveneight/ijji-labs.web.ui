import type { Config } from '@netlify/functions';

import { json, withAdmin } from '../../shared/admin/http.ts';

export const config: Config = { path: '/api/admin/me' };

/** GET /api/admin/me: whether you're signed in, and until when. The dashboard asks on load. */
export default withAdmin(async (_request, session) =>
    json(200, { signedIn: true, expiresAt: session.exp * 1000 }),
);
