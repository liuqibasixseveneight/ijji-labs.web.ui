// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRequest, ENV, memoryBlobs, sessionFor } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

import { listRequests, saveRequest } from '../../shared/deletionRequests.ts';
import handler from './admin-deletion-requests.ts';

const PATH = '/api/admin/deletion-requests';

describe('the admin-deletion-requests function', () => {
    let cookie: string;
    let id: string;

    beforeEach(async () => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        cookie = await sessionFor();
        id = await saveRequest({
            app: 'ijji-tracker',
            appName: 'IJJI Tracker',
            email: 'me@example.com',
        });
    });

    const change = (body: unknown) => handler(adminRequest(PATH, { method: 'POST', cookie, body }));

    it('lists the requests for the admin', async () => {
        const response = await handler(adminRequest(PATH, { cookie }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.requests).toHaveLength(1);
        expect(body.requests[0]).toMatchObject({ id, email: 'me@example.com', status: 'new' });
        expect(typeof body.now).toBe('number');
    });

    it('moves a request on, with a note', async () => {
        const response = await change({ id, status: 'done', note: '  Deleted in Supabase  ' });

        expect(response.status).toBe(200);
        expect((await response.json()).request).toMatchObject({ status: 'done' });
        expect((await listRequests())[0].history.at(-1)).toMatchObject({
            status: 'done',
            note: 'Deleted in Supabase',
        });
    });

    it('can change nothing but the status and note', async () => {
        await change({ id, status: 'done', email: 'someone@else.com', app: 'other' });
        expect((await listRequests())[0]).toMatchObject({
            email: 'me@example.com',
            app: 'ijji-tracker',
        });
    });

    it.each([
        ['invalid JSON', '{'],
        ['an unknown status', { status: 'deleted' }],
        ['an id that isn’t one', { id: 'request/../x', status: 'done' }],
        ['a very long note', { status: 'done', note: 'x'.repeat(501) }],
    ])('refuses %s', async (_, body) => {
        const response = await change(typeof body === 'string' ? body : { id, ...body });
        expect(response.status).toBe(400);
        expect((await listRequests())[0].status).toBe('new');
    });

    it('says when there’s no such request', async () => {
        expect((await change({ id: crypto.randomUUID(), status: 'done' })).status).toBe(404);
    });

    it('refuses a change from another site, or without a session', async () => {
        expect(
            (
                await handler(
                    adminRequest(PATH, {
                        method: 'POST',
                        cookie,
                        origin: 'https://evil.example',
                        body: { id, status: 'done' },
                    }),
                )
            ).status,
        ).toBe(403);
        expect(
            (await handler(adminRequest(PATH, { method: 'POST', body: { id, status: 'done' } })))
                .status,
        ).toBe(401);
        expect((await listRequests())[0].status).toBe('new');
    });
});
