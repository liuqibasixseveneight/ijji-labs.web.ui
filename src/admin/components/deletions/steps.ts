import { site } from '../../../content/site.ts';

/** The steps for every request, as the panel walks through them. */
export const STEPS = [
    {
        title: 'Check it’s them',
        description: `Email them from ${site.email} to confirm they asked.`,
    },
    {
        title: 'Wait for their reply',
        description: 'Move it to Awaiting confirmation while you wait.',
    },
    {
        title: 'Delete the account',
        description: 'Run the deletion SQL in the production Supabase project.',
    },
    {
        title: 'Tell them, then close it',
        description: 'Email them that it’s done, and mark it Done.',
    },
] as const;
