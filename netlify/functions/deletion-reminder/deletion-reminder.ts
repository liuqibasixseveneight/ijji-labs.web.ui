import type { Config } from '@netlify/functions';

import { site } from '../../../src/content/site.ts';
import {
    daysLeft,
    listRequests,
    OPEN,
    pruneRequests,
    type DeletionRequest,
} from '../../shared/deletionRequests.ts';
import { escapeHtml, sendToStudio } from '../../shared/email.ts';

/** Every morning. Scheduled functions have no public address. */
export const config: Config = { schedule: '0 8 * * *' };

const DAY = 24 * 60 * 60 * 1000;

/** A request is worth a reminder once it's a week old, or when 3 days or fewer are left. */
export const needsReminder = (request: DeletionRequest, now: number) =>
    OPEN.includes(request.status) &&
    (now - request.receivedAt >= 7 * DAY || daysLeft(request, now) <= 3);

const when = (days: number) =>
    days < 0
        ? `${-days} day${days === -1 ? '' : 's'} overdue`
        : `${days} day${days === 1 ? '' : 's'} left`;

/** The reminder: how many, and how long each has left. No email addresses or reasons. */
export const reminderEmail = (due: DeletionRequest[], now: number) => {
    const soonest = Math.min(...due.map((request) => daysLeft(request, now)));
    const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });

    return {
        subject: `Deletion requests: ${due.length} to finish, the next ${when(soonest)}`,
        html: `
      <p>These web requests to delete an app account are still open. We've promised to finish ${escapeHtml(site.deletionTime)}.</p>
      <ul>${due
          .map(
              (request) =>
                  `<li>${escapeHtml(request.appName)}, received ${dateFormat.format(request.receivedAt)}: <strong>${when(daysLeft(request, now))}</strong></li>`,
          )
          .join('')}</ul>
      <p>See them in the admin dashboard: ${escapeHtml(`${site.url}/admin/deletion-requests`)}</p>
    `,
        replyTo: process.env.CONTACT_EMAIL_TO!,
    };
};

/**
 * Daily: emails a reminder about deletion requests still open after a week or nearly due,
 * then removes what the privacy policy says we no longer keep.
 */
export default async () => {
    const now = Date.now();
    const due = (await listRequests()).filter((request) => needsReminder(request, now));

    if (due.length) await sendToStudio(reminderEmail(due, now));

    const pruned = await pruneRequests(now);
    console.log(
        `Deletion requests: ${due.length} reminded, ${pruned.redacted} redacted, ${pruned.deleted} deleted`,
    );
};
