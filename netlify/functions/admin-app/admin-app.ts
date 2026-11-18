import type { Config } from '@netlify/functions';

import { appBuilds, projectUrl } from '../../shared/admin/expo.ts';
import { json, withAdmin } from '../../shared/admin/http.ts';

export const config: Config = { path: '/api/admin/app' };

/**
 * GET /api/admin/app: IJJI Tracker's EAS builds and store submissions (needs EXPO_TOKEN, a
 * Viewer-role robot token). One request to Expo answers both parts, so they fail together.
 */
export default withAdmin(async () => {
    const now = Date.now();
    const token = process.env.EXPO_TOKEN;

    if (!token) {
        const missing = { data: null, error: 'EXPO_TOKEN isn’t set in Netlify yet.' };
        return json(200, { now, projectUrl, builds: missing, submissions: missing });
    }

    try {
        const result = await appBuilds(token);
        return json(200, {
            now,
            projectUrl,
            builds: { data: result.builds, error: null },
            submissions: { data: result.submissions, error: null },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unavailable';
        console.error('Admin app:', message);
        const failed = { data: null, error: message };
        return json(200, { now, projectUrl, builds: failed, submissions: failed });
    }
});
