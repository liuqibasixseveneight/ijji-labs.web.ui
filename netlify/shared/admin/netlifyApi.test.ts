// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { listDeploys } from './netlifyApi.ts';

describe('Netlify deploys', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('are read with a GET, and only the fields the dashboard shows are kept', async () => {
        const fetch = vi.fn(async () =>
            Response.json([
                {
                    id: 'd1',
                    state: 'ready',
                    context: 'production',
                    branch: 'master',
                    title: 'Merge develop',
                    commit_ref: 'abc123',
                    created_at: '2026-11-20T10:00:00Z',
                    published_at: '2026-11-20T10:01:00Z',
                    deploy_time: 51,
                    error_message: null,
                    admin_url: 'https://app.netlify.com/sites/ijji-labs',
                    build_log_url: 'secret-ish',
                    committer: 'someone',
                },
            ]),
        );
        vi.stubGlobal('fetch', fetch);

        const [deploy] = await listDeploys('TOKEN', 'site-1', 5);

        expect(deploy).toEqual({
            id: 'd1',
            state: 'ready',
            context: 'production',
            branch: 'master',
            title: 'Merge develop',
            commitRef: 'abc123',
            createdAt: '2026-11-20T10:00:00Z',
            publishedAt: '2026-11-20T10:01:00Z',
            deployTime: 51,
            errorMessage: null,
            adminUrl: 'https://app.netlify.com/sites/ijji-labs/deploys/d1',
        });
        const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe('https://api.netlify.com/api/v1/sites/site-1/deploys?per_page=5');
        expect(init.method).toBe('GET');
        expect(init.headers).toMatchObject({ Authorization: 'Bearer TOKEN' });
    });

    it('fill in what Netlify leaves out', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                Response.json([
                    { id: 'd2', state: 'error', context: 'deploy-preview', created_at: 'x' },
                ]),
            ),
        );
        expect((await listDeploys('T', 'site-1'))[0]).toMatchObject({
            branch: null,
            title: null,
            deployTime: null,
            adminUrl: 'https://app.netlify.com/sites/site-1/deploys/d2',
        });
    });

    it('refuse a site id that isn’t one, and report Netlify’s refusals', async () => {
        await expect(listDeploys('T', '../accounts')).rejects.toThrow('Not a site id');
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('', { status: 401 })),
        );
        await expect(listDeploys('T', 'site-1')).rejects.toThrow('Netlify answered 401');
    });
});
