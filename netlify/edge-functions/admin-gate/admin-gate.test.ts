// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_ID, ENV, forge, ORIGIN, OTHER_ID, sessionFor } from '../../shared/admin/testing.ts';
import handler, { config, gate } from './admin-gate.ts';

const env = (name: string) => (ENV as Record<string, string>)[name];

const visit = (cookie?: string) =>
    gate(
        new Request(`${ORIGIN}/admin`, {
            headers: cookie ? { Cookie: `__Host-ijji_admin=${cookie}` } : {},
        }),
        env,
    );

describe('the admin edge gate', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('<h1>Page not found</h1>', { status: 200 })),
        );
    });
    afterEach(() => vi.unstubAllGlobals());

    it('lets the signed-in admin through to the dashboard', async () => {
        expect(await visit(await sessionFor())).toBeUndefined();
    });

    it.each([
        ['no session', async () => undefined],
        ['a forged session', async () => forge(await sessionFor())],
        ['an expired session', () => sessionFor({ exp: Math.floor(Date.now() / 1000) - 1 })],
        ['someone not on the allowlist', () => sessionFor({ sub: OTHER_ID })],
    ])('shows %s the site’s ordinary 404', async (_, cookie) => {
        const response = (await visit(await cookie()))!;

        expect(response.status).toBe(404);
        expect(await response.text()).toBe('<h1>Page not found</h1>');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(fetch).toHaveBeenCalledWith(new URL(`${ORIGIN}/404.html`));
    });

    it('still answers 404 if the 404 page can’t be fetched', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const response = (await visit())!;
        expect(response.status).toBe(404);
        expect(await response.text()).toBe('Page not found');
    });

    it('refuses everyone when it has no secret', async () => {
        const cookie = await sessionFor();
        const response = await gate(
            new Request(`${ORIGIN}/admin`, { headers: { Cookie: `__Host-ijji_admin=${cookie}` } }),
            (name) => (name === 'ADMIN_USER_IDS' ? ADMIN_ID : undefined),
        );
        expect(response!.status).toBe(404);
    });

    it('reads its settings from Netlify’s environment', async () => {
        vi.stubGlobal('Netlify', { env: { get: env } });
        const cookie = await sessionFor();
        const response = await handler(
            new Request(`${ORIGIN}/admin`, { headers: { Cookie: `__Host-ijji_admin=${cookie}` } }),
        );
        expect(response).toBeUndefined();
    });

    it('guards every /admin address but sign-in', () => {
        expect(config).toEqual({ path: ['/admin', '/admin/*'], excludedPath: ['/admin/sign-in'] });
    });
});
