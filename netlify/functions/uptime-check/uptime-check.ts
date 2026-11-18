import type { Config, Context } from '@netlify/functions';

import { escapeHtml, sendToStudio } from '../../shared/email.ts';
import {
    CHECKS,
    pruneRuns,
    runChecks,
    saveRun,
    updateAlert,
    type Run,
} from '../../shared/uptime.ts';

/** Every ten minutes. Scheduled functions have no public address. */
export const config: Config = { schedule: '*/10 * * * *' };

const nameOf = (path: string) => CHECKS.find((check) => check.path === path)?.name ?? path;

/** The email when something's been down for two checks in a row, or is back. */
export const alertEmail = (kind: 'down' | 'up', run: Run, base: string) => {
    const failing = run.results.filter((result) => !result.ok);
    return kind === 'down'
        ? {
              subject: `Site check failing: ${failing.map((r) => nameOf(r.path)).join(', ')}`,
              html: `
      <p>These have failed two checks in a row (ten minutes apart):</p>
      <ul>${failing
          .map(
              (r) =>
                  `<li>${escapeHtml(nameOf(r.path))} (${escapeHtml(r.path)}): ${
                      r.status ? `status ${r.status}` : 'no answer'
                  }</li>`,
          )
          .join('')}</ul>
      <p>The App Store and Google Play link to the app policy pages, so those matter most.</p>
      <p>Details in the admin dashboard: ${escapeHtml(`${base}/admin/website`)}</p>
    `,
              replyTo: process.env.CONTACT_EMAIL_TO!,
          }
        : {
              subject: 'Site checks passing again',
              html: `<p>Every check passed again at ${new Date(run.at).toUTCString()}.</p>`,
              replyTo: process.env.CONTACT_EMAIL_TO!,
          };
};

/**
 * Checks the live site's key pages and the contact function, keeps the result for the admin
 * dashboard, emails after two failed runs in a row (and when it recovers), and clears runs
 * older than 30 days.
 */
export default async (_request: Request, context: Context) => {
    const base = context.site.url ?? process.env.URL ?? 'https://www.ijji-labs.com';
    const run = await runChecks(base);
    await saveRun(run);

    const alert = await updateAlert(run);
    if (alert) {
        await sendToStudio(alertEmail(alert, run, base)).catch((error) =>
            console.error('Uptime alert not sent:', error),
        );
    }

    await pruneRuns(run.at);
    const failed = run.results.filter((result) => !result.ok).length;
    console.log(`Uptime: ${run.results.length - failed} of ${run.results.length} passed`);
};
