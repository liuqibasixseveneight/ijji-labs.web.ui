// Test helpers for the admin functions: an in-memory stand-in for Blobs, the environment,
// and requests as the dashboard (or anyone else) would send them. Used by tests only.
import { SESSION_SECONDS, signSession, type Session } from './session.ts';

export const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_ID = '22222222-2222-4222-8222-222222222222';
export const SECRET = 'a-test-secret-that-is-long-enough-1234';
export const ORIGIN = 'https://www.ijji-labs.com';

export const ENV = {
    ADMIN_USER_IDS: ADMIN_ID,
    ADMIN_SESSION_SECRET: SECRET,
    SUPABASE_PROD_URL: 'https://prod.supabase.co',
    SUPABASE_PROD_ANON_KEY: 'anon-key-anon-key-anon-key',
    CONTACT_EMAIL_FROM: 'site@example.com',
    CONTACT_EMAIL_TO: 'studio@example.com',
};

/** A Blobs store kept in a Map, for `vi.mock('…/blobs.ts')`. */
export const memoryBlobs = () => {
    const data = new Map<string, string>();
    const store = () => ({
        get: async (key: string) => {
            const value = data.get(key);
            return value === undefined ? null : JSON.parse(value);
        },
        setJSON: async (key: string, value: unknown) => {
            data.set(key, JSON.stringify(value));
        },
        delete: async (key: string) => {
            data.delete(key);
        },
        list: async ({ prefix = '' }: { prefix?: string } = {}) => ({
            blobs: [...data.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })),
        }),
    });
    return { data, store };
};

/** A signed session cookie value; override anything to make a bad one. */
export const sessionFor = async (overrides: Partial<Session> = {}, secret = SECRET) => {
    const now = Math.floor(Date.now() / 1000);
    return signSession(
        {
            v: 1,
            sub: ADMIN_ID,
            aal: 'aal2',
            iat: now,
            exp: now + SESSION_SECONDS,
            epoch: 0,
            ...overrides,
        },
        secret,
    );
};

/** A request from the dashboard: our Origin, the X-Admin-Request header, and the cookie. */
export const adminRequest = (
    path: string,
    {
        method = 'GET',
        cookie,
        body,
        origin = ORIGIN,
        header = true,
    }: {
        method?: string;
        cookie?: string;
        body?: unknown;
        origin?: string | null;
        header?: boolean;
    } = {},
) =>
    new Request(`${ORIGIN}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(origin !== null && { Origin: origin }),
            ...(header && { 'X-Admin-Request': '1' }),
            ...(cookie && { Cookie: `__Host-ijji_admin=${cookie}` }),
        },
        body:
            body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });

/**
 * The same cookie with a different signature. Changes the signature's first character: its
 * last one carries base64 padding bits, so changing that can leave the bytes as they were.
 */
export const forge = (cookie: string) => {
    const [body, signature] = cookie.split('.');
    return `${body}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
};
