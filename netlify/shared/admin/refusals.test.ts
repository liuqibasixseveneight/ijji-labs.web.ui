// @vitest-environment node
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRequest, ENV, forge, memoryBlobs, OTHER_ID, sessionFor } from './testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../blobs.ts', () => ({ store: () => blobs.current!.store() }));

/**
 * The refusal matrix: every admin endpoint (each `admin-*` function but sign-in itself) turns
 * away everyone but the signed-in admin, in the same way. A new admin function is picked up
 * here without anyone adding it.
 */
const functionsDir = resolve(import.meta.dirname, '../../functions');
const endpoints = readdirSync(functionsDir).filter(
    (name) => name.startsWith('admin-') && name !== 'admin-session',
);

type AdminFunction = {
    default: (request: Request) => Promise<Response>;
    config: { path: string };
};

const load = (name: string) =>
    import(`../../functions/${name}/${name}.ts`) as Promise<AdminFunction>;

describe('every admin endpoint', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('has been found', () => {
        expect(endpoints).toContain('admin-me');
    });

    describe.each(endpoints)('%s', (name) => {
        const call = async (options: Parameters<typeof adminRequest>[1] = {}) => {
            const fn = await load(name);
            return fn.default(adminRequest(fn.config.path, options));
        };

        it('lives at /api/admin/*, not at the default /.netlify/functions address', async () => {
            expect((await load(name)).config.path).toMatch(/^\/api\/admin\//);
        });

        it('answers the signed-in admin', async () => {
            const response = await call({ cookie: await sessionFor() });
            expect(response.status).toBe(200);
            expect(response.headers.get('Cache-Control')).toBe('no-store');
        });

        it.each([
            ['no session', async () => undefined],
            ['a forged session', async () => forge(await sessionFor())],
            ['a session signed with another secret', () => sessionFor({}, 'x'.repeat(40))],
            ['an expired session', () => sessionFor({ exp: Math.floor(Date.now() / 1000) - 1 })],
            ['someone not on the allowlist', () => sessionFor({ sub: OTHER_ID })],
            ['a session without MFA', () => sessionFor({ aal: 'aal1' as 'aal2' })],
            ['a session from before "sign out everywhere"', () => sessionFor({ epoch: -1 })],
        ])('refuses %s with 401', async (_, cookie) => {
            const response = await call({ cookie: await cookie() });
            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Not signed in.' });
        });

        it('refuses requests from other sites, or without the admin header, with 403', async () => {
            const cookie = await sessionFor();
            expect((await call({ cookie, origin: 'https://evil.example' })).status).toBe(403);
            expect((await call({ cookie, header: false })).status).toBe(403);
        });

        it('refuses methods it doesn’t take with 405', async () => {
            const cookie = await sessionFor();
            for (const method of ['PUT', 'PATCH']) {
                expect((await call({ cookie, method })).status).toBe(405);
            }
        });

        it('refuses everyone with 500 when it isn’t configured', async () => {
            const cookie = await sessionFor();
            delete process.env.ADMIN_USER_IDS;
            expect((await call({ cookie })).status).toBe(500);
        });
    });
});
