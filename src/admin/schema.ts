import { z } from '../lib/zod.ts';

/** The admin sign-in. Shared by the form and the admin-session function, which checks every post. */
export const signInSchema = z.object({
    email: z.email('Enter your email address'),
    password: z.string().min(1, 'Enter your password').max(200),
    /** The 6-digit code from your authenticator app. Empty only while setting one up. */
    code: z
        .string()
        .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app')
        .optional()
        .or(z.literal('')),
    /** The authenticator being set up, when confirming it. */
    factorId: z.uuid().optional(),
    /** Hidden from people; only bots fill it in. */
    website: z.string().optional(),
});

export type SignInData = z.infer<typeof signInSchema>;
