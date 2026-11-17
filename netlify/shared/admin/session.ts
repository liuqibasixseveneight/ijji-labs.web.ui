// The admin session cookie. Signed with HMAC-SHA256 through Web Crypto only, so the same
// code runs in the Node functions and in the Deno edge gate (netlify/edge-functions). Keep
// it free of Node and npm imports for that reason.

export const COOKIE = '__Host-ijji_admin';

/** How long a sign-in lasts. There's no refresh: after this, you sign in again. */
export const SESSION_SECONDS = 4 * 60 * 60;

export type Session = {
    v: 1;
    /** The Supabase user id, checked against ADMIN_USER_IDS on every request. */
    sub: string;
    /** Signed in with a password and an authenticator code. */
    aal: 'aal2';
    /** Issued and expiry times, in seconds since 1970. */
    iat: number;
    exp: number;
    /** Bumped by "Sign out everywhere"; a session from an older epoch is refused. */
    epoch: number;
};

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

const fromBase64Url = (text: string) => {
    const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const hmacKey = (secret: string) =>
    crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    );

/** A cookie value: the session as base64url JSON, a dot, and its signature. */
export const signSession = async (session: Session, secret: string) => {
    const body = toBase64Url(encoder.encode(JSON.stringify(session)));
    const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(body));
    return `${body}.${toBase64Url(new Uint8Array(signature))}`;
};

const isSession = (value: unknown): value is Session => {
    const s = value as Session;
    return (
        typeof s === 'object' &&
        s !== null &&
        s.v === 1 &&
        typeof s.sub === 'string' &&
        s.aal === 'aal2' &&
        Number.isInteger(s.iat) &&
        Number.isInteger(s.exp) &&
        Number.isInteger(s.epoch)
    );
};

/**
 * The session in a cookie value, or null if it's missing, malformed, tampered with, signed
 * with another secret, expired, not MFA, or for someone not on the allowlist. The signature
 * is checked with `crypto.subtle.verify`, which compares in constant time.
 */
export const verifySession = async (
    value: string | undefined,
    { secret, allowlist, now = Date.now() }: { secret: string; allowlist: string[]; now?: number },
): Promise<Session | null> => {
    if (!value || !secret) return null;

    const [body, signature, extra] = value.split('.');
    if (!body || !signature || extra !== undefined) return null;

    try {
        const valid = await crypto.subtle.verify(
            'HMAC',
            await hmacKey(secret),
            fromBase64Url(signature),
            encoder.encode(body),
        );
        if (!valid) return null;

        const session: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
        if (!isSession(session)) return null;
        if (session.exp * 1000 <= now) return null;
        if (!allowlist.includes(session.sub)) return null;

        return session;
    } catch {
        return null;
    }
};

/** One cookie's value from a Cookie header. */
export const readCookie = (header: string | null, name = COOKIE) => {
    for (const part of (header ?? '').split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key === name) return rest.join('=');
    }
    return undefined;
};

/** `ADMIN_USER_IDS`: comma-separated Supabase user ids. */
export const parseAllowlist = (value: string | undefined) =>
    (value ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

/** Set-Cookie for a new session: httpOnly, HTTPS only, this site only, sent on its own pages only. */
export const sessionCookie = (value: string) =>
    `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;

/** Set-Cookie that removes the session. */
export const clearedCookie = () =>
    `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
