// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
    clearedCookie,
    parseAllowlist,
    readCookie,
    sessionCookie,
    verifySession,
} from './session.ts';
import { ADMIN_ID, OTHER_ID, SECRET, sessionFor } from './testing.ts';

const check = (value: string | undefined, allowlist = [ADMIN_ID], secret = SECRET) =>
    verifySession(value, { secret, allowlist });

describe('the admin session cookie', () => {
    it('accepts a session it signed, for the admin', async () => {
        const session = await check(await sessionFor());
        expect(session).toMatchObject({ sub: ADMIN_ID, aal: 'aal2', epoch: 0 });
    });

    it('refuses no cookie, junk, or the wrong number of parts', async () => {
        expect(await check(undefined)).toBeNull();
        expect(await check('')).toBeNull();
        expect(await check('junk')).toBeNull();
        expect(await check('a.b.c')).toBeNull();
        expect(await check('%%%.%%%')).toBeNull();
    });

    it('refuses a session signed with another secret', async () => {
        expect(await check(await sessionFor({}, 'another-secret-another-secret-12345'))).toBeNull();
        expect(await check(await sessionFor(), [ADMIN_ID], ''), 'no secret set').toBeNull();
    });

    it('refuses a tampered session', async () => {
        const [, signature] = (await sessionFor()).split('.');
        const forged = btoa(
            JSON.stringify({ v: 1, sub: OTHER_ID, aal: 'aal2', iat: 0, exp: 9e9, epoch: 0 }),
        ).replace(/=+$/, '');
        expect(await check(`${forged}.${signature}`, [ADMIN_ID, OTHER_ID])).toBeNull();
    });

    it('refuses an expired session', async () => {
        expect(
            await check(await sessionFor({ exp: Math.floor(Date.now() / 1000) - 1 })),
        ).toBeNull();
    });

    it('refuses anyone no longer on the allowlist', async () => {
        expect(await check(await sessionFor({ sub: OTHER_ID }))).toBeNull();
        expect(await check(await sessionFor(), [])).toBeNull();
    });

    it('refuses a session without MFA or of an unknown shape', async () => {
        // Signed properly, but not what we issue.
        expect(await check(await sessionFor({ aal: 'aal1' as 'aal2' }))).toBeNull();
        expect(await check(await sessionFor({ v: 2 as 1 }))).toBeNull();
        expect(await check(await sessionFor({ epoch: 1.5 }))).toBeNull();
    });

    it('reads its cookie from a Cookie header', () => {
        expect(readCookie('a=1; __Host-ijji_admin=x.y; b=2')).toBe('x.y');
        expect(readCookie('a=1')).toBeUndefined();
        expect(readCookie(null)).toBeUndefined();
    });

    it('is httpOnly, HTTPS-only, SameSite=Strict and host-only', () => {
        const cookie = sessionCookie('x.y');
        expect(cookie).toMatch(/^__Host-ijji_admin=x\.y;/);
        for (const flag of ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=14400']) {
            expect(cookie).toContain(flag);
        }
        expect(cookie).not.toContain('Domain');
        expect(clearedCookie()).toContain('Max-Age=0');
    });

    it('reads the allowlist from a comma-separated list', () => {
        expect(parseAllowlist(` ${ADMIN_ID} , ,${OTHER_ID}`)).toEqual([ADMIN_ID, OTHER_ID]);
        expect(parseAllowlist(undefined)).toEqual([]);
    });
});
