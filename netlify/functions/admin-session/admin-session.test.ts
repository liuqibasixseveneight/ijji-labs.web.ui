// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    ADMIN_ID,
    adminRequest,
    ENV,
    memoryBlobs,
    sessionFor,
} from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

const signIn = vi.hoisted(() => vi.fn());
vi.mock('../../shared/admin/supabaseAuth.ts', () => ({ signIn }));

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

import { MAX_FAILURES } from '../../shared/admin/state.ts';
import { verifySession } from '../../shared/admin/session.ts';
import handler, { LOCKED, REFUSED } from './admin-session.ts';

const valid = { email: 'admin@ijji-labs.com', password: 'pw', code: '123456' };
const post = (body: unknown, options = {}) =>
    handler(adminRequest('/api/admin/session', { method: 'POST', body, ...options }));

const cookieValue = (response: Response) =>
    response.headers.get('Set-Cookie')!.split(';')[0].split('=').slice(1).join('=');

describe('the admin-session function', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        delete process.env.ADMIN_MFA_ENROLL;
        signIn.mockReset().mockResolvedValue({ ok: true, userId: ADMIN_ID });
        send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null });
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('signs the admin in with a session cookie of our own', async () => {
        const response = await post(valid);

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(signIn).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(valid));

        const session = await verifySession(cookieValue(response), {
            secret: ENV.ADMIN_SESSION_SECRET,
            allowlist: [ADMIN_ID],
        });
        expect(session).toMatchObject({ sub: ADMIN_ID, aal: 'aal2', epoch: 0 });
        expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    });

    it('gives every failure the same answer, and sets no cookie', async () => {
        signIn.mockResolvedValue({ ok: false });
        const response = await post(valid);

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: REFUSED });
        expect(response.headers.get('Set-Cookie')).toBeNull();
    });

    it('hands back a new authenticator to scan, without signing in', async () => {
        signIn.mockResolvedValue({ ok: 'enrol', factorId: 'f', qrCode: 'data:,', secret: 'S' });
        const response = await post({ ...valid, code: '' });

        expect(await response.json()).toEqual({
            enrol: { factorId: 'f', qrCode: 'data:,', secret: 'S' },
        });
        expect(response.headers.get('Set-Cookie')).toBeNull();
    });

    it('locks sign-in after too many failures, and emails the studio once', async () => {
        signIn.mockResolvedValue({ ok: false });
        for (let i = 0; i < MAX_FAILURES; i++) await post(valid);

        expect(send).toHaveBeenCalledOnce();
        expect(send.mock.calls[0][0].subject).toBe('Admin sign-in locked for an hour');

        // Locked: even the right details are refused, without asking Supabase.
        signIn.mockClear().mockResolvedValue({ ok: true, userId: ADMIN_ID });
        const response = await post(valid);
        expect(response.status).toBe(429);
        expect(await response.json()).toEqual({ error: LOCKED });
        expect(signIn).not.toHaveBeenCalled();
    });

    it('keeps no record of who tried: only times', async () => {
        signIn.mockResolvedValue({ ok: false });
        await post(valid);
        expect([...blobs.current!.data.values()].join()).not.toMatch(/admin@|pw|123456/);
    });

    it.each([
        ['invalid JSON', '{'],
        ['a missing password', { ...valid, password: '' }],
        ['a code that isn’t 6 digits', { ...valid, code: '12' }],
    ])('refuses %s without asking Supabase', async (_, body) => {
        expect((await post(body)).status).toBe(400);
        expect(signIn).not.toHaveBeenCalled();
    });

    it('refuses a bot that fills the hidden field', async () => {
        expect((await post({ ...valid, website: 'x' })).status).toBe(401);
        expect(signIn).not.toHaveBeenCalled();
    });

    it('refuses posts from other sites, or without the admin header', async () => {
        expect((await post(valid, { origin: 'https://evil.example' })).status).toBe(403);
        expect((await post(valid, { origin: null })).status).toBe(403);
        expect((await post(valid, { header: false })).status).toBe(403);
        expect(signIn).not.toHaveBeenCalled();
    });

    it('only takes POST and DELETE', async () => {
        expect((await handler(adminRequest('/api/admin/session'))).status).toBe(405);
    });

    it('answers 500, and signs nobody in, when it isn’t configured', async () => {
        delete process.env.ADMIN_SESSION_SECRET;
        expect((await post(valid)).status).toBe(500);
        expect(signIn).not.toHaveBeenCalled();
    });

    describe('signing out', () => {
        const signOut = (path: string, cookie?: string) =>
            handler(adminRequest(path, { method: 'DELETE', cookie }));

        it('clears the cookie', async () => {
            const response = await signOut('/api/admin/session');
            expect(response.status).toBe(200);
            expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
        });

        it('everywhere: ends every session, but only for the admin', async () => {
            expect((await signOut('/api/admin/session?everywhere=1')).status).toBe(401);

            const cookie = await sessionFor();
            expect((await signOut('/api/admin/session?everywhere=1', cookie)).status).toBe(200);

            // The old session is from an earlier epoch now.
            expect((await signOut('/api/admin/session?everywhere=1', cookie)).status).toBe(401);
        });

        it('everywhere: answers 500 when it isn’t configured', async () => {
            delete process.env.ADMIN_SESSION_SECRET;
            expect((await signOut('/api/admin/session?everywhere=1')).status).toBe(500);
        });
    });
});
