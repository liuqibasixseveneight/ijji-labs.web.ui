// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    ADMIN_ID,
    adminRequest,
    ENV,
    memoryBlobs,
    sessionFor,
} from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { get } from '../../shared/admin/supabaseMgmt.ts';
import { projectFor } from '../../shared/admin/supabaseProject.ts';
import handler from './admin-supabase.ts';

const PROD_REF = 'abcdefghijklmnopqrst';
const DEV_REF = 'tsrqponmlkjihgfedcba';
const SUPABASE = {
    ...ENV,
    SUPABASE_PROD_URL: `https://${PROD_REF}.supabase.co`,
    SUPABASE_PROD_SERVICE_KEY: 'sb_secret_prod-key-prod-key',
    SUPABASE_DEV_URL: `https://${DEV_REF}.supabase.co`,
    SUPABASE_DEV_SERVICE_KEY: 'eyJhbGciOi.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.c2lnbmF0dXJl',
    // Separate organisations, so a token each.
    SUPABASE_PROD_ACCESS_TOKEN: 'sbp_prod-access-token',
    SUPABASE_DEV_ACCESS_TOKEN: 'sbp_dev-access-token',
};

// What a person's details look like, planted in Supabase's replies: none may come out.
const EMAIL = 'jo.bloggs@example.com';
const PERSON = '3f2b1c9e-8a7d-4e6f-9b0a-1c2d3e4f5a6b';
const IP = '203.0.113.42';

const days = (fill: (i: number) => number) => Array.from({ length: 90 }, (_, i) => fill(i));

const STATS = {
    from: '2026-08-21',
    users: 42,
    confirmed: 40,
    signups_by_day: days((i) => (i === 89 ? 2 : i % 10 === 0 ? 1 : 0)),
    sessions_by_day: days((i) => i % 3),
    minutes_by_day: days((i) => (i % 3) * 25),
    sessions: 512,
    recorders: { day: 3, week: 9, month: 20 },
};
const DB = {
    database_bytes: 12_582_912,
    tables: [{ name: 'sessions', rows: 512, bytes: 98_304 }],
    migrations: { count: 21, latest: '20261118120000' },
};

type Reply = (url: URL, init: RequestInit) => Response | undefined;

const upstream = (overrides: Reply = () => undefined) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: string | URL, init: RequestInit = {}) => {
            const url = new URL(String(input));
            const override = overrides(url, init);
            if (override) return override;
            if (url.pathname === '/rest/v1/rpc/admin_stats') return Response.json(STATS);
            if (url.pathname === '/rest/v1/rpc/admin_db_stats') return Response.json(DB);
            const path = url.pathname.replace(/[a-z0-9]{20}/, 'REF');
            switch (path) {
                case '/v1/projects/REF':
                    return Response.json({
                        name: 'ijji-tracker',
                        region: 'eu-west-1',
                        status: 'ACTIVE_HEALTHY',
                        database: { host: 'db.x.supabase.co' },
                    });
                case '/v1/projects/REF/health':
                    return Response.json([
                        { name: 'db', healthy: true, status: 'ACTIVE_HEALTHY' },
                        { name: 'auth', healthy: false, status: 'UNHEALTHY', error: EMAIL },
                    ]);
                case '/v1/projects/REF/advisors/security':
                    return Response.json({
                        lints: [
                            {
                                name: 'auth_users_exposed',
                                title: 'Exposed Auth Users',
                                level: 'WARN',
                                detail: `View leaks ${EMAIL} for user ${PERSON}`,
                                remediation: 'https://supabase.com/docs/guides/database/linter',
                            },
                            {
                                name: 'rls_disabled_in_public',
                                title: 'RLS Disabled in Public',
                                level: 'ERROR',
                                detail: 'Table public.x has RLS off',
                                remediation: 'https://evil.example/phish',
                            },
                        ],
                    });
                case '/v1/projects/REF/advisors/performance':
                    return Response.json({ lints: [] });
                case '/v1/projects/REF/analytics/endpoints/logs': {
                    const sql = url.searchParams.get('sql') ?? '';
                    return Response.json({
                        result: sql.includes('toStartOfHour')
                            ? [
                                  {
                                      hour: '2026-11-18 12:00:00',
                                      requests: 120,
                                      client_errors: 4,
                                      server_errors: 1,
                                  },
                                  {
                                      hour: '2026-11-18 13:00:00',
                                      requests: 80,
                                      client_errors: 0,
                                      server_errors: 0,
                                  },
                              ]
                            : [
                                  {
                                      status: 503,
                                      method: 'POST',
                                      path: `/rest/v1/rpc/delete_account?email=${EMAIL}&ip=${IP}`,
                                      count: 1,
                                  },
                              ],
                    });
                }
            }
            return new Response('not found', { status: 404 });
        }),
    );

const call = async (search = '') =>
    handler(adminRequest(`/api/admin/supabase${search}`, { cookie: await sessionFor() }));

const calls = () =>
    vi.mocked(fetch).mock.calls.map(([input, init]) => ({
        url: new URL(String(input)),
        init: (init ?? {}) as RequestInit,
    }));

describe('the Supabase endpoint', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, SUPABASE);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        for (const key of Object.keys(SUPABASE)) delete process.env[key];
        delete process.env.SUPABASE_ACCESS_TOKEN;
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('shows production: counts, size, status, services, advisors and traffic', async () => {
        upstream();
        const response = await call();
        expect(response.status).toBe(200);
        const body = await response.json();

        expect(body).toMatchObject({ env: 'prod', ref: PROD_REF });
        expect(body.project.data).toEqual({
            name: 'ijji-tracker',
            region: 'eu-west-1',
            status: 'ACTIVE_HEALTHY',
            paused: false,
        });
        expect(body.health.data).toEqual([
            { name: 'db', status: 'ACTIVE_HEALTHY', healthy: true },
            { name: 'auth', status: 'UNHEALTHY', healthy: false },
        ]);
        expect(body.usage.data).toMatchObject({ users: 42, sessions: 512, recorders: { week: 9 } });
        expect(body.usage.data.signupsByDay).toHaveLength(90);
        expect(body.database.data).toMatchObject({
            bytes: 12_582_912,
            limitBytes: 500 * 1024 * 1024,
            migrations: { count: 21 },
        });
        // Most serious first, and only links to Supabase's own docs.
        expect(body.security.data.map((l: { level: string }) => l.level)).toEqual([
            'ERROR',
            'WARN',
        ]);
        expect(body.security.data[0].remediation).toBeNull();
        expect(body.performance.data).toEqual([]);
        expect(body.traffic.data.hours).toEqual([
            { at: Date.UTC(2026, 10, 18, 12), requests: 120, clientErrors: 4, serverErrors: 1 },
            { at: Date.UTC(2026, 10, 18, 13), requests: 80, clientErrors: 0, serverErrors: 0 },
        ]);
        expect(body.traffic.data.topErrors).toEqual([
            { status: 503, method: 'POST', path: '/rest/v1/rpc/delete_account', count: 1 },
        ]);
    });

    it('never passes on anything that could identify a person', async () => {
        upstream();
        const text = await (await call()).text();
        expect(text).not.toContain(EMAIL);
        expect(text).not.toContain(PERSON);
        expect(text).not.toContain(IP);
        expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
        expect(text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        // Nor any key or token.
        expect(text).not.toMatch(/sb_secret_|sbp_|eyJ/);
    });

    it('leaves the admin’s own account out of the counts', async () => {
        upstream();
        await call();
        const rpc = calls().find((c) => c.url.pathname.endsWith('/admin_stats'))!;
        expect(JSON.parse(String(rpc.init.body))).toEqual({ exclude: [ADMIN_ID] });
    });

    it('sends each key only where it belongs, and only reads with the access token', async () => {
        upstream();
        await call();
        for (const { url, init } of calls()) {
            const headers = init.headers as Record<string, string>;
            if (url.hostname === 'api.supabase.com') {
                expect(init.method).toBe('GET');
                expect(headers.Authorization).toBe('Bearer sbp_prod-access-token');
                expect(headers.apikey).toBeUndefined();
            } else {
                expect(url.origin).toBe(`https://${PROD_REF}.supabase.co`);
                expect(url.pathname).toMatch(/^\/rest\/v1\/rpc\/admin_(db_)?stats$/);
                expect(headers.apikey).toBe('sb_secret_prod-key-prod-key');
                // A new-style secret key isn't a JWT, so it isn't sent as a bearer token.
                expect(headers.Authorization).toBeUndefined();
            }
        }
    });

    it('shows develop with ?env=dev, and only prod or dev', async () => {
        upstream();
        const body = await (await call('?env=dev')).json();
        expect(body).toMatchObject({ env: 'dev', ref: DEV_REF });
        const rpc = calls().find((c) => c.url.pathname.endsWith('/admin_stats'))!;
        expect(rpc.url.origin).toBe(`https://${DEV_REF}.supabase.co`);
        // An older JWT service key goes as a bearer token as well.
        expect((rpc.init.headers as Record<string, string>).Authorization).toMatch(/^Bearer eyJ/);
        // Develop's own access token, for its own organisation.
        for (const { url, init } of calls().filter((c) => c.url.hostname === 'api.supabase.com')) {
            expect(url.pathname).toContain(DEV_REF);
            expect((init.headers as Record<string, string>).Authorization).toBe(
                'Bearer sbp_dev-access-token',
            );
        }

        expect((await call('?env=staging')).status).toBe(400);
    });

    it('says what isn’t set up yet, part by part', async () => {
        upstream();
        delete process.env.SUPABASE_PROD_ACCESS_TOKEN;
        delete process.env.SUPABASE_PROD_SERVICE_KEY;
        const body = await (await call()).json();
        expect(body.project.error).toBe('SUPABASE_PROD_ACCESS_TOKEN isn’t set in Netlify yet.');
        expect(body.usage.error).toBe('SUPABASE_PROD_SERVICE_KEY isn’t set in Netlify yet.');

        delete process.env.SUPABASE_DEV_URL;
        const dev = await (await call('?env=dev')).json();
        expect(dev.ref).toBeNull();
        expect(dev.usage.error).toBe('SUPABASE_DEV_URL isn’t set in Netlify yet.');
    });

    it('takes one token for both projects, if that’s what’s set', async () => {
        upstream();
        delete process.env.SUPABASE_PROD_ACCESS_TOKEN;
        process.env.SUPABASE_ACCESS_TOKEN = 'sbp_one-for-both';
        const body = await (await call()).json();
        expect(body.project.data).not.toBeNull();
        const mgmt = calls().filter((c) => c.url.hostname === 'api.supabase.com');
        expect(mgmt.length).toBeGreaterThan(0);
        for (const { init } of mgmt) {
            expect((init.headers as Record<string, string>).Authorization).toBe(
                'Bearer sbp_one-for-both',
            );
        }
    });

    it('says a paused project is paused, without waiting on it', async () => {
        upstream((url) =>
            url.pathname === `/v1/projects/${PROD_REF}`
                ? Response.json({ name: 'ijji-tracker', region: 'eu-west-1', status: 'INACTIVE' })
                : undefined,
        );
        const body = await (await call()).json();
        expect(body.project.data.paused).toBe(true);
        expect(body.usage.error).toMatch(/paused/);
        expect(body.traffic.error).toMatch(/paused/);
        expect(calls()).toHaveLength(1);
    });

    it('says when the migration hasn’t been applied, and turns away a reply of the wrong shape', async () => {
        upstream((url) => {
            if (url.pathname.endsWith('/admin_stats')) return new Response('', { status: 404 });
            if (url.pathname.endsWith('/admin_db_stats')) {
                return Response.json({
                    database_bytes: 1,
                    tables: [{ name: 'x; drop', rows: 1, bytes: 1 }],
                });
            }
        });
        const body = await (await call()).json();
        expect(body.usage.error).toMatch(/apply the admin_stats migration/);
        expect(body.database.data).toBeNull();
        // Which part was off, not zod's details.
        expect(body.database.error).toBe(
            'admin_db_stats() answered in an unexpected shape (at tables.0.name): is the migration up to date?',
        );
    });

    it('says which key to check when Supabase refuses it', async () => {
        upstream((url) =>
            url.pathname.includes('/rpc/')
                ? Response.json(
                      { code: '42501', message: 'permission denied for function admin_stats' },
                      { status: 401 },
                  )
                : undefined,
        );
        const body = await (await call()).json();
        expect(body.usage.error).toBe(
            'Supabase refused the key: check SUPABASE_PROD_SERVICE_KEY is this project’s secret (service_role) key, not its publishable (anon) key.',
        );
        // The access token's cards are unaffected.
        expect(body.project.data).not.toBeNull();
    });

    it('knows a missing function by PostgREST’s code, and passes on anything else scrubbed', async () => {
        upstream((url) => {
            if (url.pathname.endsWith('/admin_stats')) {
                return Response.json(
                    { code: 'PGRST202', message: 'Could not find the function' },
                    { status: 400 },
                );
            }
            if (url.pathname.endsWith('/admin_db_stats')) {
                return Response.json(
                    { code: 'XX000', message: `boom for ${EMAIL}` },
                    { status: 500 },
                );
            }
        });
        const body = await (await call()).json();
        expect(body.usage.error).toMatch(
            /apply the admin_stats migration \(npx supabase db push\)/,
        );
        expect(body.database.error).toBe('Supabase answered 500 (XX000): boom for [email]');
    });
});

describe('the Management API wrapper', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('only calls the paths it lists', async () => {
        vi.stubGlobal('fetch', vi.fn());
        for (const path of [
            '/v1/projects',
            `/v1/projects/${PROD_REF}/database/query`,
            `/v1/projects/${PROD_REF}/secrets`,
            `/v1/projects/../organizations`,
        ]) {
            await expect(get('t', path)).rejects.toThrow('Not an allowed path');
        }
        expect(fetch).not.toHaveBeenCalled();
    });
});

describe('a project’s address', () => {
    it('must be a hosted Supabase project, over https', () => {
        const ok = projectFor('prod', { SUPABASE_PROD_URL: `https://${PROD_REF}.supabase.co/` });
        expect(ok).toMatchObject({
            ref: PROD_REF,
            url: `https://${PROD_REF}.supabase.co`,
            key: null,
        });
        for (const url of [
            `http://${PROD_REF}.supabase.co`,
            'https://evil.example',
            `https://${PROD_REF}.supabase.co.evil.example`,
            'nonsense',
        ]) {
            expect(projectFor('prod', { SUPABASE_PROD_URL: url })).toHaveProperty('error');
        }
    });
});
