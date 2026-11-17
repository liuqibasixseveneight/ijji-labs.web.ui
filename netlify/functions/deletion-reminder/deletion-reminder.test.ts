// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV, memoryBlobs } from '../../shared/admin/testing.ts';

const blobs = vi.hoisted(() => ({ current: null as null | ReturnType<typeof memoryBlobs> }));
vi.mock('../../shared/blobs.ts', () => ({ store: () => blobs.current!.store() }));

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
    Resend: class {
        emails = { send };
    },
}));

import { changeStatus, listRequests, saveRequest } from '../../shared/deletionRequests.ts';
import run, { config } from './deletion-reminder.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 30, 8);

const save = (daysAgo: number, email = 'me@example.com') =>
    saveRequest(
        { app: 'ijji-tracker', appName: 'IJJI Tracker', email, reason: 'Private reason' },
        NOW - daysAgo * DAY,
    );

describe('the daily deletion reminder', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        Object.assign(process.env, ENV);
        send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null });
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => vi.useRealTimers());

    it('runs every morning', () => {
        expect(config.schedule).toBe('0 8 * * *');
    });

    it('stays quiet while every open request is new and has time', async () => {
        await save(2);
        await run();
        expect(send).not.toHaveBeenCalled();
    });

    it('reminds about requests a week old, nearly due or overdue, without personal details', async () => {
        await save(2);
        await save(8);
        await save(28);
        await save(32);

        await run();

        expect(send).toHaveBeenCalledOnce();
        const message = send.mock.calls[0][0];
        expect(message.to).toBe(ENV.CONTACT_EMAIL_TO);
        expect(message.subject).toBe('Deletion requests: 3 to finish, the next 2 days overdue');
        expect(message.html).toContain('22 days left');
        expect(message.html).toContain('2 days left');
        expect(message.html).toContain('/admin/deletion-requests');
        expect(message.html).not.toContain('me@example.com');
        expect(message.html).not.toContain('Private reason');
    });

    it('says 1 day, not 1 days', async () => {
        await save(29);
        await save(31);
        await run();
        expect(send.mock.calls[0][0].subject).toBe(
            'Deletion requests: 2 to finish, the next 1 day overdue',
        );
        expect(send.mock.calls[0][0].html).toContain('1 day left');
    });

    it('leaves closed requests out, and clears what the policy says it no longer keeps', async () => {
        const old = await save(60, 'old@example.com');
        await changeStatus(old, 'done', undefined, NOW - 40 * DAY);
        const ancient = await save(500);
        await changeStatus(ancient, 'done', undefined, NOW - 400 * DAY);

        await run();

        expect(send).not.toHaveBeenCalled();
        const left = await listRequests();
        expect(left).toHaveLength(1);
        expect(left[0]).toMatchObject({ id: old, email: null });
    });
});
