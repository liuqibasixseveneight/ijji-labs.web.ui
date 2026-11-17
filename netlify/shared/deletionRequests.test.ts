// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryBlobs } from './admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('./blobs.ts', () => ({ store: () => blobs.current!.store() }));

import {
    changeStatus,
    daysLeft,
    listRequests,
    pruneRequests,
    saveRequest,
} from './deletionRequests.ts';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 10, 1);
const save = (email: string, at = T0) =>
    saveRequest({ app: 'ijji-tracker', appName: 'IJJI Tracker', email, reason: 'Bye' }, at);

describe('deletion requests', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
    });

    it('are saved as new, due 30 days after they arrive', async () => {
        const id = await save('a@example.com');
        const [request] = await listRequests();

        expect(request).toEqual({
            id,
            app: 'ijji-tracker',
            appName: 'IJJI Tracker',
            email: 'a@example.com',
            reason: 'Bye',
            receivedAt: T0,
            dueAt: T0 + 30 * DAY,
            status: 'new',
            history: [{ at: T0, status: 'new' }],
        });
        expect(daysLeft(request, T0 + 0.5 * DAY)).toBe(30);
        expect(daysLeft(request, T0 + 31 * DAY)).toBe(-1);
    });

    it('keep no reason when none was given', async () => {
        await saveRequest({ app: 'ijji-tracker', appName: 'IJJI Tracker', email: 'a@x.com' }, T0);
        expect((await listRequests())[0].reason).toBeNull();
    });

    it('are listed open first (soonest due), then closed (latest first)', async () => {
        const late = await save('late@example.com', T0 + 5 * DAY);
        const early = await save('early@example.com', T0);
        const closedFirst = await save('c1@example.com', T0);
        const closedLast = await save('c2@example.com', T0);
        await changeStatus(closedFirst, 'done', undefined, T0 + 1 * DAY);
        await changeStatus(closedLast, 'rejected', undefined, T0 + 2 * DAY);

        expect((await listRequests()).map((r) => r.id)).toEqual([
            early,
            late,
            closedLast,
            closedFirst,
        ]);
    });

    it('move on with a note, and remember when they closed', async () => {
        const id = await save('a@example.com');

        await changeStatus(id, 'awaiting-confirmation', 'Emailed to confirm', T0 + DAY);
        const done = await changeStatus(id, 'done', undefined, T0 + 2 * DAY);

        expect(done).toMatchObject({ status: 'done', closedAt: T0 + 2 * DAY });
        expect(done!.history).toEqual([
            { at: T0, status: 'new' },
            { at: T0 + DAY, status: 'awaiting-confirmation', note: 'Emailed to confirm' },
            { at: T0 + 2 * DAY, status: 'done' },
        ]);

        // Reopened by mistake: open again, and closed from the later date.
        expect((await changeStatus(id, 'new', undefined, T0 + 3 * DAY))!.closedAt).toBeUndefined();
        expect((await changeStatus(id, 'done', undefined, T0 + 4 * DAY))!.closedAt).toBe(
            T0 + 4 * DAY,
        );
    });

    it('can’t be changed when they don’t exist', async () => {
        expect(await changeStatus(crypto.randomUUID(), 'done', undefined)).toBeNull();
    });

    describe('kept only as long as the privacy policy says', () => {
        it('lose the email, reason and notes 30 days after closing', async () => {
            const id = await save('a@example.com');
            await changeStatus(id, 'done', 'Deleted a@example.com', T0 + DAY);

            expect(await pruneRequests(T0 + 30 * DAY)).toEqual({ redacted: 0, deleted: 0 });
            expect(await pruneRequests(T0 + 31 * DAY)).toEqual({ redacted: 1, deleted: 0 });

            const [request] = await listRequests();
            expect(request).toMatchObject({ email: null, reason: null, status: 'done' });
            expect(JSON.stringify(request)).not.toContain('a@example.com');
            expect(JSON.stringify(request)).not.toContain('Bye');

            // Once is enough.
            expect(await pruneRequests(T0 + 32 * DAY)).toEqual({ redacted: 0, deleted: 0 });
        });

        it('are deleted a year after closing', async () => {
            const id = await save('a@example.com');
            await changeStatus(id, 'rejected', undefined, T0 + DAY);

            expect(await pruneRequests(T0 + 366 * DAY)).toEqual({ redacted: 0, deleted: 1 });
            expect(await listRequests()).toEqual([]);
        });

        it('keep everything while still open, however old', async () => {
            await save('a@example.com');
            expect(await pruneRequests(T0 + 400 * DAY)).toEqual({ redacted: 0, deleted: 0 });
            expect((await listRequests())[0].email).toBe('a@example.com');
        });
    });
});
