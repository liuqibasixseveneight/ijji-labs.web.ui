import type { AdminEnv } from './env.ts';

// Supabase Auth's REST API, called from the server only. The tokens it hands back never
// leave the function: we check who signed in, then sign the Supabase session out again.
//
// Every refusal looks the same to the browser. Why it was refused goes to the function's
// log on Netlify (Logs → Functions → admin-session), so problems can be found: the step,
// and Supabase's status and error code. Never the email, password, code or a token.

type Factor = { id: string; factor_type: string; status: 'verified' | 'unverified' };
type User = { id: string; factors?: Factor[] };
type Tokens = { access_token: string; user: User };

export type Enrolment = { factorId: string; qrCode: string; secret: string };

export type SignInResult =
    | { ok: true; userId: string }
    | ({ ok: 'enrol' } & Enrolment)
    | { ok: false };

const call = async <T>(
    env: AdminEnv,
    path: string,
    init: { method?: string; token?: string; body?: object } = {},
): Promise<T | null> => {
    try {
        const response = await fetch(`${env.supabaseUrl}/auth/v1/${path}`, {
            method: init.method ?? (init.body ? 'POST' : 'GET'),
            headers: {
                apikey: env.anonKey,
                'Content-Type': 'application/json',
                ...(init.token && { Authorization: `Bearer ${init.token}` }),
            },
            body: init.body && JSON.stringify(init.body),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            console.warn(
                `Admin sign-in: Supabase ${step(path)} answered ${response.status}`,
                body.error_code ?? body.code ?? body.error ?? '',
            );
            return null;
        }
        return response.status === 204 ? ({} as T) : ((await response.json()) as T);
    } catch {
        console.warn(`Admin sign-in: couldn’t reach Supabase for ${step(path)}`);
        return null;
    }
};

/** A path without its ids or query, for the log: `factors/:id/verify`. */
const step = (path: string) => path.split('?')[0].replace(/[0-9a-f-]{36}/g, ':id');

/** Refuses, noting why in the function's log. */
const refuse = (reason: string): SignInResult => {
    console.warn(`Admin sign-in refused: ${reason}`);
    return { ok: false };
};

/** The claims in a JWT we've just been given by Supabase (its signature is Supabase's job). */
const claims = (token: string): { sub?: string; aal?: string } => {
    try {
        const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(part));
    } catch {
        return {};
    }
};

const totp = (user: User, status: Factor['status']) =>
    (user.factors ?? []).filter((f) => f.factor_type === 'totp' && f.status === status);

/** Answers a challenge on `factorId` with `code`; the aal2 access token, or null. */
const verifyCode = async (env: AdminEnv, token: string, factorId: string, code: string) => {
    const challenge = await call<{ id: string }>(env, `factors/${factorId}/challenge`, {
        token,
        body: {},
    });
    if (!challenge) return null;

    const verified = await call<{ access_token: string }>(env, `factors/${factorId}/verify`, {
        token,
        body: { challenge_id: challenge.id, code },
    });
    return verified?.access_token ?? null;
};

/**
 * Signs in to the production project with a password and an authenticator code, and says
 * whether that's the admin. Every refusal looks the same to the caller.
 *
 * While `ADMIN_MFA_ENROLL` is on, an allowlisted account with no authenticator yet gets a new
 * one to scan (`ok: 'enrol'`), and confirms it by signing in again with its `factorId`.
 */
export const signIn = async (
    env: AdminEnv,
    input: { email: string; password: string; code?: string; factorId?: string },
): Promise<SignInResult> => {
    const session = await call<Tokens>(env, 'token?grant_type=password', {
        body: { email: input.email, password: input.password },
    });
    if (!session) return refuse('wrong email or password, or the account can’t sign in');

    let token = session.access_token;
    const user = session.user;

    try {
        if (!env.allowlist.includes(user.id)) return refuse('not on ADMIN_USER_IDS');

        const verified = totp(user, 'verified');

        if (verified.length) {
            if (!input.code) return refuse('no authenticator code');
            for (const factor of verified) {
                const aal2 = await verifyCode(env, token, factor.id, input.code);
                if (aal2) {
                    token = aal2;
                    return (await confirm(env, aal2, user.id))
                        ? { ok: true, userId: user.id }
                        : refuse('Supabase didn’t confirm an aal2 session');
                }
            }
            return refuse('wrong authenticator code');
        }

        // No authenticator yet: only while enrolment is switched on.
        if (!env.enrolOpen) {
            return refuse('no authenticator set up, and ADMIN_MFA_ENROLL isn’t "true"');
        }

        const pending = totp(user, 'unverified');
        if (input.factorId && input.code && pending.some((f) => f.id === input.factorId)) {
            const aal2 = await verifyCode(env, token, input.factorId, input.code);
            if (!aal2) return refuse('wrong code for the new authenticator');
            token = aal2;
            return (await confirm(env, aal2, user.id))
                ? { ok: true, userId: user.id }
                : refuse('Supabase didn’t confirm an aal2 session');
        }

        // Start again with a fresh authenticator, so half-finished ones don't pile up.
        for (const factor of pending) {
            await call(env, `factors/${factor.id}`, { token, method: 'DELETE' });
        }
        const enrolled = await call<{ id: string; totp: { qr_code: string; secret: string } }>(
            env,
            'factors',
            { token, body: { factor_type: 'totp', friendly_name: 'ijji labs admin' } },
        );
        if (!enrolled) return refuse('Supabase wouldn’t set up an authenticator');

        return {
            ok: 'enrol',
            factorId: enrolled.id,
            qrCode: qrDataUri(enrolled.totp.qr_code),
            secret: enrolled.totp.secret,
        };
    } finally {
        // We keep nothing from Supabase: end the session it just made.
        await call(env, 'logout?scope=local', { token, body: {} });
    }
};

/**
 * Supabase hands the QR code back as an SVG in a `data:` URI that isn't URL-encoded
 * (`data:image/svg+xml;utf-8,<svg …fill="#000000"…>`). Browsers read the first `#` as the
 * end of the address, so the image comes out broken. This re-encodes it properly, whether
 * it arrives raw, already encoded, or as plain SVG; a base64 one is left as it is.
 */
export const qrDataUri = (value: string) => {
    let svg = value;
    if (value.startsWith('data:')) {
        const comma = value.indexOf(',');
        if (value.slice(0, comma).includes(';base64')) return value;
        svg = value.slice(comma + 1);
        try {
            svg = decodeURIComponent(svg);
        } catch {
            // Raw SVG with a stray % (e.g. width="100%"): use it as it is.
        }
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Supabase itself vouches for the token, and it's this user at aal2. */
const confirm = async (env: AdminEnv, token: string, userId: string) => {
    const user = await call<User>(env, 'user', { token });
    const { sub, aal } = claims(token);
    return user?.id === userId && sub === userId && aal === 'aal2';
};
