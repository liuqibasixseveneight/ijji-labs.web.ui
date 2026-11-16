import { z } from '../../../../lib/zod.ts';

/** A web request to delete an app account. Shared by the form and the Netlify function. */
export const deletionRequestSchema = z.object({
    /** The app's slug, e.g. `ijji-tracker`. */
    app: z.string().regex(/^[a-z0-9-]{1,40}$/),
    email: z.email('Please enter the email address on your account'),
    reason: z
        .string()
        .max(500, 'Please keep this under 500 characters')
        .optional()
        .or(z.literal('')),
    confirm: z.literal(true, { error: 'Please confirm you want the account deleted' }),
    /** Hidden from people; only bots fill it in. */
    website: z.string().optional(),
});

export type DeletionRequestData = z.infer<typeof deletionRequestSchema>;
