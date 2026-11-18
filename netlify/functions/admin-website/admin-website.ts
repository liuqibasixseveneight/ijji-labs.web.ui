import type { Config } from '@netlify/functions';

import { json, withAdmin } from '../../shared/admin/http.ts';
import { listDeploys } from '../../shared/admin/netlifyApi.ts';
import { readFormStats } from '../../shared/formStats.ts';
import { readScores } from '../../shared/lighthouse.ts';
import { readRuns, summarise } from '../../shared/uptime.ts';

export const config: Config = { path: '/api/admin/website' };

/** One part's data, or why it couldn't be had: one failing source doesn't blank the page. */
const part = async <T>(load: () => Promise<T>) => {
    try {
        return { data: await load(), error: null };
    } catch (error) {
        console.error('Admin website:', error);
        return { data: null, error: error instanceof Error ? error.message : 'Unavailable' };
    }
};

/**
 * GET /api/admin/website: the site at a glance. Uptime of the key pages (from the
 * uptime-check runs), Lighthouse scores (from lighthouse-check), Netlify deploys (needs
 * NETLIFY_API_TOKEN) and form traffic (counts only).
 */
export default withAdmin(async (_request, _session, _env, context) => {
    const token = process.env.NETLIFY_API_TOKEN;
    const siteId = context?.site.id ?? process.env.SITE_ID;
    const now = Date.now();

    const [uptime, lighthouse, deploys, forms] = await Promise.all([
        part(async () => summarise(await readRuns(7, now), now)),
        part(readScores),
        token && siteId
            ? part(() => listDeploys(token, siteId))
            : Promise.resolve({ data: null, error: 'NETLIFY_API_TOKEN isn’t set in Netlify yet.' }),
        part(() => readFormStats(30, now)),
    ]);

    return json(200, { now, uptime, lighthouse, deploys, forms });
});
