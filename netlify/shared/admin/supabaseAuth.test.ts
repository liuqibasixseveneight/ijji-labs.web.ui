// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminEnv } from './env.ts';
import { qrDataUri, signIn } from './supabaseAuth.ts';
import { ADMIN_ID, ENV, OTHER_ID } from './testing.ts';

const FACTOR = '33333333-3333-4333-8333-333333333333';
const PENDING = '44444444-4444-4444-8444-444444444444';

const jwt = (claims: object) => `h.${btoa(JSON.stringify(claims))}.s`;
const AAL1 = jwt({ sub: ADMIN_ID, aal: 'aal1' });
const AAL2 = jwt({ sub: ADMIN_ID, aal: 'aal2' });

type Factor = { id: string; factor_type: string; status: string };

/** A pretend Supabase Auth: answers by path, and records every call. */
const supabase = ({
    userId = ADMIN_ID,
    factors = [{ id: FACTOR, factor_type: 'totp', status: 'verified' }] as Factor[],
    password = true,
    code = '123456',
    verifiedToken = AAL2,
    userCheck = true,
} = {}) => {
    const calls: { path: string; method: string; body?: unknown; auth?: string | null }[] = [];

    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init: RequestInit) => {
            const path = url.replace(`${ENV.SUPABASE_PROD_URL}/auth/v1/`, '');
            const body = init.body ? JSON.parse(init.body as string) : undefined;
            const headers = init.headers as Record<string, string>;
            calls.push({ path, method: init.method!, body, auth: headers.Authorization });
            const ok = (data: object) => new Response(JSON.stringify(data), { status: 200 });
            const no = () =>
                new Response(
                    JSON.stringify({
                        error_code: path.startsWith('token') ? 'invalid_credentials' : 'bad',
                    }),
                    { status: 400 },
                );

            if (path === 'token?grant_type=password') {
                return password ? ok({ access_token: AAL1, user: { id: userId, factors } }) : no();
            }
            if (path.endsWith('/challenge')) return ok({ id: 'challenge-1' });
            if (path.endsWith('/verify')) {
                return body.code === code ? ok({ access_token: verifiedToken }) : no();
            }
            if (path === 'user') return userCheck ? ok({ id: userId }) : no();
            if (path === 'factors') {
                return ok({
                    id: PENDING,
                    totp: { qr_code: 'data:image/svg+xml;utf-8,<svg/>', secret: 'ABC' },
                });
            }
            if (path.startsWith('factors/') && init.method === 'DELETE') return ok({});
            if (path.startsWith('logout')) return new Response(null, { status: 204 });
            return no();
        }),
    );

    return calls;
};

const env = (extra: Record<string, string> = {}) => adminEnv({ ...ENV, ...extra })!;
const input = { email: 'admin@ijji-labs.com', password: 'pw', code: '123456' };

/** Everything signIn wrote to the function's log. */
let logged: string[] = [];

describe('signing in with Supabase', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        logged = [];
        vi.spyOn(console, 'warn').mockImplementation((...args) => {
            logged.push(args.join(' '));
        });
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it.each([
        [
            'a wrong password',
            {},
            { password: false },
            ['Supabase token answered 400 invalid_credentials', 'wrong email or password'],
        ],
        ['someone not on the allowlist', {}, { userId: OTHER_ID }, ['not on ADMIN_USER_IDS']],
        ['no code', { code: '' }, {}, ['no authenticator code']],
        [
            'a wrong code',
            { code: '000000' },
            {},
            ['factors/:id/verify answered 400', 'wrong authenticator code'],
        ],
        [
            'no authenticator while enrolment is off',
            { code: '' },
            { factors: [] },
            ['ADMIN_MFA_ENROLL'],
        ],
    ])(
        'logs why it refused %s, and never the details typed in',
        async (_, change, setup, reasons) => {
            supabase(setup);
            expect(await signIn(env(), { ...input, ...change })).toEqual({ ok: false });

            const log = logged.join('\n');
            for (const reason of reasons) expect(log).toContain(reason);
            // Not the email, password, code or a token (the fake tokens start "h.ey").
            expect(log).not.toMatch(/admin@ijji-labs\.com|\bpw\b|123456|000000|h\.ey/);
        },
    );

    it('signs in the admin with a password and a code, then signs Supabase out again', async () => {
        const calls = supabase();

        expect(await signIn(env(), input)).toEqual({ ok: true, userId: ADMIN_ID });

        expect(calls.map((c) => c.path)).toEqual([
            'token?grant_type=password',
            `factors/${FACTOR}/challenge`,
            `factors/${FACTOR}/verify`,
            'user',
            'logout?scope=local',
        ]);
        expect(calls.at(-1)!.auth).toBe(`Bearer ${AAL2}`);
    });

    it('refuses a wrong password', async () => {
        const calls = supabase({ password: false });
        expect(await signIn(env(), input)).toEqual({ ok: false });
        expect(calls).toHaveLength(1);
    });

    it('refuses anyone not on the allowlist, before asking for a code', async () => {
        const calls = supabase({ userId: OTHER_ID });
        expect(await signIn(env(), input)).toEqual({ ok: false });
        expect(calls.map((c) => c.path)).toEqual([
            'token?grant_type=password',
            'logout?scope=local',
        ]);
    });

    it('refuses a wrong code, or none', async () => {
        supabase();
        expect(await signIn(env(), { ...input, code: '000000' })).toEqual({ ok: false });
        expect(await signIn(env(), { ...input, code: '' })).toEqual({ ok: false });
    });

    it('refuses when the token is not aal2, or Supabase doesn’t vouch for it', async () => {
        supabase({ verifiedToken: AAL1 });
        expect(await signIn(env(), input)).toEqual({ ok: false });

        supabase({ userCheck: false });
        expect(await signIn(env(), input)).toEqual({ ok: false });

        supabase({ verifiedToken: 'not-a-jwt' });
        expect(await signIn(env(), input)).toEqual({ ok: false });
    });

    it('refuses an account with no authenticator while enrolment is off', async () => {
        const calls = supabase({ factors: [] });
        expect(await signIn(env(), { ...input, code: '' })).toEqual({ ok: false });
        expect(calls.some((c) => c.path === 'factors')).toBe(false);
    });

    describe('while ADMIN_MFA_ENROLL is on', () => {
        const open = () => env({ ADMIN_MFA_ENROLL: 'true' });

        it('sets up a fresh authenticator, clearing half-finished ones', async () => {
            const calls = supabase({
                factors: [{ id: 'old', factor_type: 'totp', status: 'unverified' }],
            });

            expect(await signIn(open(), { ...input, code: '' })).toEqual({
                ok: 'enrol',
                factorId: PENDING,
                qrCode: 'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
                secret: 'ABC',
            });
            expect(calls.find((c) => c.method === 'DELETE')!.path).toBe('factors/old');
            expect(calls.at(-1)!.path).toBe('logout?scope=local');
        });

        it('confirms the new authenticator with its code', async () => {
            supabase({ factors: [{ id: PENDING, factor_type: 'totp', status: 'unverified' }] });
            expect(await signIn(open(), { ...input, factorId: PENDING })).toEqual({
                ok: true,
                userId: ADMIN_ID,
            });
        });

        it('refuses a wrong code for the new authenticator', async () => {
            supabase({ factors: [{ id: PENDING, factor_type: 'totp', status: 'unverified' }] });
            expect(await signIn(open(), { ...input, factorId: PENDING, code: '000000' })).toEqual({
                ok: false,
            });
        });

        it('never enrols a second authenticator once one is verified', async () => {
            const calls = supabase();
            expect(await signIn(open(), { ...input, code: '' })).toEqual({ ok: false });
            expect(calls.some((c) => c.path === 'factors')).toBe(false);
        });
    });

    it('refuses when Supabase can’t be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        expect(await signIn(env(), input)).toEqual({ ok: false });
    });
});

describe('the admin environment', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));

    it('reads the settings', () => {
        expect(adminEnv({ ...ENV, SUPABASE_PROD_URL: 'https://prod.supabase.co/' })).toEqual({
            allowlist: [ADMIN_ID],
            secret: ENV.ADMIN_SESSION_SECRET,
            enrolOpen: false,
            supabaseUrl: 'https://prod.supabase.co',
            anonKey: ENV.SUPABASE_PROD_ANON_KEY,
        });
    });

    it.each([
        ['no allowlist', { ADMIN_USER_IDS: '' }],
        ['an allowlist that isn’t user ids', { ADMIN_USER_IDS: 'me' }],
        ['a short secret', { ADMIN_SESSION_SECRET: 'short' }],
        ['a Supabase URL without HTTPS', { SUPABASE_PROD_URL: 'http://prod.supabase.co' }],
        ['no anon key', { SUPABASE_PROD_ANON_KEY: undefined }],
    ])('is missing with %s, so nothing signs in', (_, change) => {
        expect(adminEnv({ ...ENV, ...change })).toBeNull();
    });
});

describe('the QR code from Supabase', () => {
    const svg = '<svg width="100%"><path fill="#000000" d="M0 0h1v1H0z"/></svg>';
    const clean = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    it('is re-encoded, so a # in its colours can’t cut the image short', () => {
        expect(qrDataUri(`data:image/svg+xml;utf-8,${svg}`)).toBe(clean);
        expect(clean).not.toContain('#');
    });

    it('comes out the same whether it arrives encoded, raw or as plain SVG', () => {
        expect(qrDataUri(`data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`)).toBe(clean);
        expect(qrDataUri(svg)).toBe(clean);
    });

    it('leaves a base64 image alone', () => {
        expect(qrDataUri('data:image/svg+xml;base64,PHN2Zy8+')).toBe(
            'data:image/svg+xml;base64,PHN2Zy8+',
        );
    });
});
