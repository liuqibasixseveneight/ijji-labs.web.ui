import { z } from '../../../src/lib/zod.ts';
import { parseAllowlist } from './session.ts';

/**
 * What the admin functions need from the environment. Set in Netlify as secret values
 * scoped to Functions (ADMIN_SESSION_SECRET and ADMIN_USER_IDS to Edge functions too, for the
 * gate). Never prefixed VITE_, so Vite can't put any of them in the browser bundle.
 */
const schema = z.object({
    ADMIN_USER_IDS: z.string().transform(parseAllowlist).pipe(z.array(z.uuid()).min(1)),
    ADMIN_SESSION_SECRET: z.string().min(32),
    /** 'true' only while you set up your authenticator app; remove it straight after. */
    ADMIN_MFA_ENROLL: z.string().optional(),
    SUPABASE_PROD_URL: z.url({ protocol: /^https$/ }),
    SUPABASE_PROD_ANON_KEY: z.string().min(20),
});

export type AdminEnv = {
    allowlist: string[];
    secret: string;
    enrolOpen: boolean;
    supabaseUrl: string;
    anonKey: string;
};

/** The admin settings, or null when one is missing or malformed (the caller answers 500). */
export const adminEnv = (
    env: Record<string, string | undefined> = process.env,
): AdminEnv | null => {
    const parsed = schema.safeParse(env);
    if (!parsed.success) {
        console.error(
            'Admin is not configured:',
            parsed.error.issues.map((issue) => issue.path.join('.')).join(', '),
        );
        return null;
    }

    const e = parsed.data;
    return {
        allowlist: e.ADMIN_USER_IDS,
        secret: e.ADMIN_SESSION_SECRET,
        enrolOpen: e.ADMIN_MFA_ENROLL === 'true',
        supabaseUrl: e.SUPABASE_PROD_URL.replace(/\/+$/, ''),
        anonKey: e.SUPABASE_PROD_ANON_KEY,
    };
};
