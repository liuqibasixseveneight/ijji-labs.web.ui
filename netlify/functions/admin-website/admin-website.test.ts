// @vitest-environment node
import type { Context } from '@netlify/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRequest, ENV, memoryBlobs, sessionFor } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { countForm } from '../../shared/formStats.ts';
import handler from './admin-website.ts';

const context = { site: { id: 'site-1', url: 'https://ijji-labs.com' } } as Context;

describe('the admin-website function', () => {
    let cookie: string;

    beforeEach(async () => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        delete process.env.NETLIFY_API_TOKEN;
        cookie = await sessionFor();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const get = async () => {
        const response = await handler(adminRequest('/api/admin/website', { cookie }), context);
        expect(response.status).toBe(200);
        return response.json();
    };

    it('sends uptime, Lighthouse, deploys and form counts', async () => {
        process.env.NETLIFY_API_TOKEN = 'TOKEN';
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json([])),
        );
        await countForm('contact', 'sent');

        const body = await get();

        expect(body.uptime).toMatchObject({ error: null });
        expect(body.uptime.data).toHaveLength(7);
        expect(body.lighthouse.data).toHaveLength(4);
        expect(body.deploys).toEqual({ data: [], error: null });
        expect(body.forms.data.forms.contact.total.sent).toBe(1);
        expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('/sites/site-1/deploys');
    });

    it('says the Netlify token is missing, and still sends the rest', async () => {
        const body = await get();
        expect(body.deploys).toEqual({
            data: null,
            error: 'NETLIFY_API_TOKEN isn’t set in Netlify yet.',
        });
        expect(body.forms.error).toBeNull();
    });

    it('keeps one source failing from blanking the page', async () => {
        process.env.NETLIFY_API_TOKEN = 'TOKEN';
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('', { status: 401 })),
        );

        const body = await get();
        expect(body.deploys).toEqual({ data: null, error: 'Netlify answered 401' });
        expect(body.uptime.error).toBeNull();
    });
});
