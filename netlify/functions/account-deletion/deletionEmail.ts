import type { DeletionRequestData } from '../../../src/components/ui/organisms/DeletionRequestForm/schema.ts';
import { site } from '../../../src/content/site.ts';
import { field, oneLine } from '../../shared/email.ts';

/** The email the studio receives for one account-deletion request, with what to do next. */
export const buildDeletionEmail = (data: DeletionRequestData, appName: string) => ({
    subject: oneLine(`Account deletion request: ${appName} — ${data.email}`),
    html: `
      <p><strong>App:</strong> ${field(appName)}</p>
      <p><strong>Account email:</strong> ${field(data.email)}</p>
      <p><strong>Reason:</strong> <span style="white-space: pre-wrap">${field(data.reason)}</span></p>
      <hr />
      <p>
        To do: reply from ${field(site.email)} to confirm the request came from this address.
        Once they confirm, delete the account in Supabase and tell them it's done.
        We've promised to finish ${field(site.deletionTime)}.
      </p>
    `,
});
