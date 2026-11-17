import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import {
    confirmEmail,
    DAY,
    deletionSql,
    describeDaysLeft,
    doneEmail,
    urgency,
    type DeletionRequest,
} from '../deletionRequests.ts';
import { adminRoutes } from '../routes.tsx';

const NOW = Date.UTC(2026, 10, 20, 12);
const SQL_EDITOR = 'https://supabase.com/dashboard/project/prodref/sql/new';

const request = (overrides: Partial<DeletionRequest>): DeletionRequest => ({
    id: '11111111-1111-4111-8111-111111111111',
    app: 'ijji-tracker',
    appName: 'IJJI Tracker',
    email: 'someone@example.com',
    reason: null,
    receivedAt: NOW - 2 * DAY,
    dueAt: NOW + 28 * DAY,
    status: 'new',
    history: [{ at: NOW - 2 * DAY, status: 'new' }],
    ...overrides,
});

const NEW = request({ reason: 'Not using it' });
const URGENT = request({
    id: '22222222-2222-4222-8222-222222222222',
    email: 'urgent@example.com',
    dueAt: NOW + 2 * DAY,
    status: 'awaiting-confirmation',
    history: [
        { at: NOW - 28 * DAY, status: 'new' },
        { at: NOW - 27 * DAY, status: 'awaiting-confirmation', note: 'Emailed to confirm' },
    ],
});
const DONE = request({
    id: '33333333-3333-4333-8333-333333333333',
    email: 'done@example.com',
    status: 'done',
    closedAt: NOW - 3 * DAY,
});
const REJECTED = request({
    id: '44444444-4444-4444-8444-444444444444',
    email: null,
    status: 'rejected',
    closedAt: NOW - 40 * DAY,
});

/** A pretend /api/admin: signed in, with these requests; records each call. */
const api = (
    requests: DeletionRequest[] | null,
    change: { status: number; body?: object } = { status: 200 },
) => {
    const fetch = vi.fn(async (url: string, init: RequestInit = {}) => {
        if (url.endsWith('/me')) {
            return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
        }
        if (init.method === 'POST') {
            return Response.json(change.body ?? {}, { status: change.status });
        }
        return requests
            ? Response.json({ requests, now: NOW, sqlEditorUrl: SQL_EDITOR })
            : Response.json({ error: 'Not allowed.' }, { status: 500 });
    });
    vi.stubGlobal('fetch', fetch);
    return fetch;
};

const posts = (fetch: ReturnType<typeof api>) =>
    fetch.mock.calls
        .filter(([, init]) => init?.method === 'POST')
        .map(([, init]) => JSON.parse(init!.body as string));

const renderAdmin = (path: string) => {
    const router = createMemoryRouter(adminRoutes, { initialEntries: [path] });
    return { router, user: userEvent.setup(), ...render(<RouterProvider router={router} />) };
};

const column = (name: RegExp) => within(screen.getByRole('region', { name }));

const panel = () => within(screen.getByRole('complementary'));

describe('the deletion requests board', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('shows how many are open in the nav and on the Overview', async () => {
        api([NEW, URGENT, DONE]);
        renderAdmin('/');

        const nav = await screen.findByRole('navigation', { name: 'Admin' });
        expect(
            within(nav).getByRole('link', { name: /^Deletion requests\s*2 open$/ }),
        ).toHaveAttribute('href', '/deletion-requests');
        const overview = within(screen.getByRole('main')).getByRole('link', {
            name: /^Deletion requests 2 open/,
        });
        expect(overview).toHaveTextContent('The next: 2 days left.');
    });

    it('says there’s nothing to do on the Overview when none are open', async () => {
        api([DONE]);
        renderAdmin('/');
        expect(await screen.findByText('0 open')).toBeInTheDocument();
        expect(screen.getByText('Nothing to do.')).toBeInTheDocument();
    });

    it('puts each request in its status’s column, with the steps above', async () => {
        api([URGENT, NEW, DONE, REJECTED]);
        const { container } = renderAdmin('/deletion-requests');

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Deletion requests' }),
        ).toBeInTheDocument();
        expect(document.title).toBe('Deletion requests · Admin · ijji labs');
        expect(screen.getByText('2 open · the next: 2 days left')).toBeInTheDocument();

        const steps = within(screen.getByRole('region', { name: 'How to handle a request' }));
        expect(steps.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
            expect.stringContaining('Check it’s them'),
            expect.stringContaining('Wait for their reply'),
            expect.stringContaining('Delete the account'),
            expect.stringContaining('Tell them, then close it'),
        ]);

        expect(
            column(/^New/).getByRole('button', { name: 'someone@example.com' }),
        ).toBeInTheDocument();
        expect(column(/^Awaiting confirmation/).getByText('2 days left')).toHaveClass('bg-red-100');
        expect(column(/^Done/).getByText('done@example.com')).toBeInTheDocument();
        expect(column(/^Rejected/).getByText('Email removed')).toBeInTheDocument();
        expect(column(/^New/).getAllByRole('button', { name: 'Copy email address' })).toHaveLength(
            1,
        );

        expect(await axeViolations(container)).toEqual([]);
    });

    it('moves a card dragged to another column', async () => {
        const fetch = api([NEW]);
        renderAdmin('/deletion-requests');

        const card = (await screen.findByRole('button', { name: 'someone@example.com' })).closest(
            'li',
        )!;
        const target = screen.getByRole('region', { name: /^Awaiting confirmation/ });
        const data = new Map<string, string>();
        const dataTransfer = {
            setData: (type: string, value: string) => data.set(type, value),
            getData: (type: string) => data.get(type) ?? '',
        };

        fireEvent.dragStart(card, { dataTransfer });
        fireEvent.dragOver(target, { dataTransfer });
        fireEvent.drop(target, { dataTransfer });

        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: NEW.id, status: 'awaiting-confirmation' }]),
        );
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it('asks before a drag closes a request, and leaves it if you say no', async () => {
        const fetch = api([NEW]);
        vi.mocked(window.confirm).mockReturnValue(false);
        renderAdmin('/deletion-requests');

        const card = (await screen.findByRole('button', { name: 'someone@example.com' })).closest(
            'li',
        )!;
        const target = screen.getByRole('region', { name: /^Done/ });
        const data = new Map<string, string>();
        const dataTransfer = {
            setData: (type: string, value: string) => data.set(type, value),
            getData: (type: string) => data.get(type) ?? '',
        };
        fireEvent.dragStart(card, { dataTransfer });
        fireEvent.drop(target, { dataTransfer });

        expect(window.confirm).toHaveBeenCalledWith('Mark this request as done?');
        expect(posts(fetch)).toEqual([]);

        // Dropped back where it was: nothing to do.
        fireEvent.drop(screen.getByRole('region', { name: /^New/ }), { dataTransfer });
        expect(posts(fetch)).toEqual([]);
    });

    it('copies an email address with one click', async () => {
        api([NEW]);
        const { user } = renderAdmin('/deletion-requests');
        const writeText = vi.spyOn(navigator.clipboard, 'writeText');

        await user.click(await screen.findByRole('button', { name: 'Copy email address' }));

        expect(writeText).toHaveBeenCalledWith('someone@example.com');
        expect(await screen.findByRole('status')).toHaveTextContent('Copied');
    });

    it('says so when copying fails', async () => {
        api([NEW]);
        const { user } = renderAdmin('/deletion-requests');
        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

        await user.click(await screen.findByRole('button', { name: 'Copy email address' }));
        expect(await screen.findByText('Couldn’t copy')).toBeInTheDocument();
    });

    it('says so when the requests can’t be loaded', async () => {
        api(null);
        renderAdmin('/deletion-requests');
        expect(await screen.findByText('Couldn’t load the requests')).toBeInTheDocument();
    });

    it('says so on the Overview when they can’t be loaded', async () => {
        api(null);
        renderAdmin('/');
        expect(
            await screen.findByText('Couldn’t load them. Open the page to try again.'),
        ).toBeInTheDocument();
    });

    it('shows empty columns plainly', async () => {
        api([]);
        renderAdmin('/deletion-requests');
        expect(await screen.findAllByText('None.')).toHaveLength(4);
    });
});

describe('a request’s panel', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const openPanel = async (requests: DeletionRequest[], email: string) => {
        const fetch = api(requests);
        const utils = renderAdmin('/deletion-requests');
        await utils.user.click(await screen.findByRole('button', { name: email }));
        await screen.findByRole('complementary');
        return { fetch, ...utils };
    };

    it('opens from its card, focused, with its details, and is accessible', async () => {
        const { router, container } = await openPanel([NEW], 'someone@example.com');

        const heading = panel().getByRole('heading', { level: 2, name: 'someone@example.com' });
        await waitFor(() => expect(heading).toHaveFocus());
        expect(router.state.location.search).toBe(`?request=${NEW.id}`);
        expect(panel().getByText('Not using it')).toBeInTheDocument();
        expect(panel().getByText('IJJI Tracker · New')).toBeInTheDocument();
        expect(await axeViolations(container)).toEqual([]);
    });

    it('walks a new request through step 1: the email to write, then moving it on', async () => {
        const { fetch, user } = await openPanel([NEW], 'someone@example.com');

        const step1 = panel().getByRole('heading', { name: 'Check it’s them' }).closest('li')!;
        expect(step1).toHaveAttribute('aria-current', 'step');
        const write = within(step1).getByRole('link', { name: 'Write the email' });
        expect(write.getAttribute('href')).toBe(confirmEmail(NEW, 'within 30 days').href);

        // The later steps wait until it's awaiting confirmation.
        expect(panel().queryByRole('button', { name: /mark as done/i })).not.toBeInTheDocument();
        expect(panel().queryByRole('link', { name: /sql editor/i })).not.toBeInTheDocument();

        await user.type(panel().getByLabelText(/^Add a note/), 'Sent from support@');
        await user.click(within(step1).getByRole('button', { name: /i’ve emailed them/i }));

        await waitFor(() =>
            expect(posts(fetch)).toEqual([
                { id: NEW.id, status: 'awaiting-confirmation', note: 'Sent from support@' },
            ]),
        );
    });

    it('gives awaiting requests the SQL, the done email and Mark as done', async () => {
        const { fetch, user } = await openPanel([URGENT], 'urgent@example.com');

        const editor = panel().getByRole('link', { name: /open the sql editor/i });
        expect(editor).toHaveAttribute('href', SQL_EDITOR);
        expect(editor).toHaveAttribute('target', '_blank');

        const writeText = vi.spyOn(navigator.clipboard, 'writeText');
        await user.click(panel().getByRole('button', { name: 'Copy the SQL' }));
        expect(writeText).toHaveBeenCalledWith(deletionSql('urgent@example.com'));

        const tell = panel()
            .getByRole('heading', { name: 'Tell them, then close it' })
            .closest('li')!;
        expect(
            within(tell).getByRole('link', { name: 'Write the email' }).getAttribute('href'),
        ).toBe(doneEmail(URGENT).href);
        expect(panel().getByText('Emailed to confirm')).toBeInTheDocument();

        await user.click(panel().getByRole('button', { name: /mark as done/i }));
        expect(window.confirm).toHaveBeenCalledWith('Mark this request as done?');
        await waitFor(() => expect(posts(fetch)).toEqual([{ id: URGENT.id, status: 'done' }]));
    });

    it('rejects a request that was never confirmed', async () => {
        const { fetch, user } = await openPanel([URGENT], 'urgent@example.com');

        await user.click(panel().getByRole('button', { name: 'Reject it' }));
        await waitFor(() => expect(posts(fetch)).toEqual([{ id: URGENT.id, status: 'rejected' }]));
    });

    it('saves a note without moving the request', async () => {
        const { fetch, user } = await openPanel([URGENT], 'urgent@example.com');

        expect(panel().getByRole('button', { name: 'Save note' })).toBeDisabled();
        await user.type(panel().getByLabelText(/^Add a note/), 'They replied');
        await user.click(panel().getByRole('button', { name: 'Save note' }));

        await waitFor(() =>
            expect(posts(fetch)).toEqual([
                { id: URGENT.id, status: 'awaiting-confirmation', note: 'They replied' },
            ]),
        );
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it('reopens a done or rejected request', async () => {
        const { fetch, user } = await openPanel([DONE], 'done@example.com');
        expect(panel().getByRole('heading', { name: 'All done' })).toBeInTheDocument();
        await user.click(panel().getByRole('button', { name: 'Reopen' }));
        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: DONE.id, status: 'awaiting-confirmation' }]),
        );
    });

    it('shows a rejected request as closed, with a way to reopen it', async () => {
        await openPanel([REJECTED], 'Email removed');
        expect(panel().getByRole('heading', { name: 'Rejected' })).toBeInTheDocument();
        expect(panel().getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
        expect(
            panel().queryByRole('button', { name: 'Copy email address' }),
        ).not.toBeInTheDocument();
    });

    it('shows why a change didn’t save', async () => {
        const fetch = api([URGENT], { status: 400, body: { error: 'Invalid change.' } });
        const { user } = renderAdmin('/deletion-requests');
        await user.click(await screen.findByRole('button', { name: 'urgent@example.com' }));
        await screen.findByRole('complementary');

        await user.click(panel().getByRole('button', { name: 'Reject it' }));
        expect(await panel().findByText('Invalid change.')).toBeInTheDocument();
        expect(posts(fetch)).toHaveLength(1);
    });

    it('says so when the server can’t be reached to save', async () => {
        const fetch = api([URGENT]);
        const { user } = renderAdmin('/deletion-requests');
        await user.click(await screen.findByRole('button', { name: 'urgent@example.com' }));
        await screen.findByRole('complementary');

        fetch.mockImplementation(async (url: string, init: RequestInit = {}) => {
            if (init.method === 'POST') throw new Error('offline');
            if (url.endsWith('/me')) return Response.json({ signedIn: true, expiresAt: NOW });
            return Response.json({ requests: [URGENT], now: NOW, sqlEditorUrl: SQL_EDITOR });
        });
        await user.click(panel().getByRole('button', { name: 'Reject it' }));

        expect(
            await panel().findByText('Couldn’t reach the server. Try again.'),
        ).toBeInTheDocument();
    });

    it.each([
        [
            'Close',
            (user: ReturnType<typeof userEvent.setup>) =>
                user.click(panel().getByRole('button', { name: 'Close' })),
        ],
        ['Esc', (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}')],
    ])('closes with %s, back to its card', async (_, close) => {
        const { user, router } = await openPanel([NEW], 'someone@example.com');

        await close(user);

        await waitFor(() => expect(screen.queryByRole('complementary')).not.toBeInTheDocument());
        expect(router.state.location.search).toBe('');
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'someone@example.com' })).toHaveFocus(),
        );
    });

    it('ignores a link to a request that doesn’t exist', async () => {
        api([NEW]);
        renderAdmin('/deletion-requests?request=nope');
        expect(
            await screen.findByRole('heading', { name: 'Deletion requests' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
});

describe('the help each request comes with', () => {
    it('describes how long is left, and how urgent that is', () => {
        expect(
            [12, 9, 1, 0, -1, -4].map((days) => `${describeDaysLeft(days)} (${urgency(days)})`),
        ).toEqual([
            '12 days left (fine)',
            '9 days left (soon)',
            '1 day left (urgent)',
            'Due today (urgent)',
            '1 day overdue (urgent)',
            '4 days overdue (urgent)',
        ]);
    });

    it('writes the emails, addressed to them, ready for the mail app', () => {
        const confirm = confirmEmail(NEW, 'within 30 days');
        expect(confirm.subject).toBe('Confirming your IJJI Tracker account deletion');
        expect(confirm.body).toContain('reply to this email to confirm');
        expect(confirm.body).toContain('within 30 days of your request');
        expect(confirm.href).toMatch(/^mailto:someone%40example\.com\?subject=Confirming%20your/);
        expect(decodeURIComponent(confirm.href.split('&body=')[1])).toBe(confirm.body);

        const done = doneEmail(NEW);
        expect(done.subject).toBe('Your IJJI Tracker account has been deleted');
        expect(done.body).toContain('deleted your IJJI Tracker account');
    });

    it('writes SQL that deletes that one account, as the app does', () => {
        const sql = deletionSql('someone@example.com');
        expect(sql).toContain("where lower(email) = lower('someone@example.com')");
        expect(sql).toContain("raise exception 'No account with that email'");
        for (const step of [
            'delete from public.classroom_members where user_id = uid',
            'delete from public.sessions where user_id = uid',
            'update public.classrooms set created_by = null where created_by = uid',
            'delete from auth.users where id = uid',
        ]) {
            expect(sql).toContain(step);
        }
    });

    it('can’t be broken out of by a quote in the email', () => {
        const sql = deletionSql("o'brien@example.com\nselect 1");
        expect(sql).toContain("lower('o''brien@example.com\nselect 1')");
        expect(sql.split('\n')[0]).toBe(
            "-- Deletes the IJJI Tracker account for o'brien@example.com select 1 and everything tied to it,",
        );
    });
});
