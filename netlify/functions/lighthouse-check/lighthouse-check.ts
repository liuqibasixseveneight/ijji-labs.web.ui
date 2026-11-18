import type { Config, Context } from '@netlify/functions';

import { pruneFormStats } from '../../shared/formStats.ts';
import { COMBOS, fetchScores, saveScores } from '../../shared/lighthouse.ts';

/**
 * 03:00, 03:15, 03:30 and 03:45 UTC: one page and strategy a run, as a PageSpeed Insights run
 * can take most of a scheduled function's 30 seconds.
 */
export const config: Config = { schedule: '0,15,30,45 3 * * *' };

/** Which of the four the run at this time takes. */
export const comboFor = (at: Date) => COMBOS[Math.floor(at.getUTCMinutes() / 15) % COMBOS.length];

/**
 * Runs PageSpeed Insights (Lighthouse) on one page and strategy against the live site, and
 * keeps the scores for the admin dashboard. The first run each morning also clears form
 * counts older than 90 days.
 */
export default async (_request: Request, context: Context) => {
    const now = new Date();
    const base = context.site.url ?? process.env.URL ?? 'https://www.ijji-labs.com';
    const { page, strategy, key } = comboFor(now);

    if (now.getUTCMinutes() < 15) {
        const pruned = await pruneFormStats(now.getTime());
        console.log(`Form counts: ${pruned} older than 90 days cleared`);
    }

    try {
        const result = await fetchScores(
            new URL(page.path, base).toString(),
            strategy,
            process.env.PSI_API_KEY || undefined,
        );
        await saveScores(key, result, now.getTime());
        console.log(`Lighthouse ${key}:`, JSON.stringify(result));
    } catch (error) {
        // Logged, not thrown: the next morning tries again, and the dashboard shows the last.
        console.error(`Lighthouse ${key} failed:`, error);
    }
};
