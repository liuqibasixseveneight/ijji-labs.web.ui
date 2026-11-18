import type { Config } from '@netlify/functions';

import { z } from '../../../src/lib/zod.ts';
import { json, withAdmin } from '../../shared/admin/http.ts';
import { COMBOS, readScores, runManual } from '../../shared/lighthouse.ts';

export const config: Config = { path: '/api/admin/lighthouse' };

const runSchema = z.object({ key: z.enum(COMBOS.map((c) => c.key) as [string, ...string[]]) });

/**
 * /api/admin/lighthouse
 * - GET: every page and strategy's scores, and when each may be run again.
 * - POST `{ key }`: runs one of the four (home or privacy, mobile or desktop) now. Only those
 *   four, against this site, and each at most once every 10 minutes. One per request, as a run
 *   takes about 20 seconds: the dashboard sends the four side by side.
 */
export default withAdmin(
    async (request, _session, _env, context) => {
        if (request.method === 'GET') return json(200, { rows: await readScores() });

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return json(400, { error: 'Invalid request.' });
        }
        const run = runSchema.safeParse(body);
        if (!run.success) return json(400, { error: 'Invalid run.' });

        const base = context?.site.url ?? process.env.URL ?? 'https://www.ijji-labs.com';
        const outcome = await runManual(run.data.key, base, process.env.PSI_API_KEY || undefined);

        if (outcome.ok) return json(200, { key: run.data.key, ...outcome.result });
        return json(
            outcome.status,
            outcome.status === 429
                ? { error: outcome.error, retryAt: outcome.retryAt }
                : { error: outcome.error },
        );
    },
    { methods: ['GET', 'POST'] },
);
