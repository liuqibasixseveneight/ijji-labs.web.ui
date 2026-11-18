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
    matches,
    sortRequests,
    urgency,
    type DeletionRequest,
} from '../deletionRequests.ts';
import { Email } from '../components/Email.tsx';
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
            // Both labels are in the DOM here (CSS shows one): 'Deletions' on phones.
            within(nav).getByRole('link', { name: /Deletion requests\s*2 open$/ }),
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
            column(/^New/).getByRole('link', { name: 'someone@example.com' }),
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

        const card = (await screen.findByRole('link', { name: 'someone@example.com' })).closest(
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

        const card = (await screen.findByRole('link', { name: 'someone@example.com' })).closest(
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

    it('moves a card with its column select, for phones and keyboards', async () => {
        const fetch = api([NEW]);
        const { user } = renderAdmin('/deletion-requests');

        const select = await screen.findByRole('combobox', { name: 'Move someone@example.com to' });
        expect(select).toHaveValue('new');
        await user.selectOptions(select, 'awaiting-confirmation');

        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: NEW.id, status: 'awaiting-confirmation' }]),
        );
    });

    it('asks before the select closes a request, and snaps back if you say no', async () => {
        const fetch = api([NEW]);
        vi.mocked(window.confirm).mockReturnValue(false);
        const { user } = renderAdmin('/deletion-requests');

        const select = await screen.findByRole('combobox', { name: 'Move someone@example.com to' });
        await user.selectOptions(select, 'rejected');

        expect(window.confirm).toHaveBeenCalledWith('Mark this request as rejected?');
        expect(select).toHaveValue('new');
        expect(posts(fetch)).toEqual([]);
    });

    it('copies an email address with one click', async () => {
        api([NEW]);
        const { user } = renderAdmin('/deletion-requests');
        const writeText = vi.spyOn(navigator.clipboard, 'writeText');

        await user.click(await screen.findByRole('button', { name: 'Copy email address' }));

        expect(writeText).toHaveBeenCalledWith('someone@example.com');
        expect(await screen.findByText('Copied')).toBeInTheDocument();
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

describe('a request’s own page', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const openPage = async (requests: DeletionRequest[], email: string) => {
        const fetch = api(requests);
        const utils = renderAdmin('/deletion-requests');
        await utils.user.click(await screen.findByRole('link', { name: email }));
        await screen.findByRole('heading', { level: 1, name: 'Deletion request' });
        return { fetch, ...utils };
    };

    const section = (name: string) => within(screen.getByRole('region', { name }));

    it('opens from its card, with the requester’s email labelled, and is accessible', async () => {
        const { router, container } = await openPage([NEW], 'someone@example.com');

        expect(router.state.location.pathname).toBe(`/deletion-requests/${NEW.id}`);
        expect(document.title).toBe('Deletion request · someone@example.com · Admin · ijji labs');

        const requester = section('Requester');
        expect(requester.getByText('Email address').nextElementSibling).toHaveTextContent(
            'someone@example.com',
        );
        expect(requester.getByRole('button', { name: 'Copy email address' })).toBeInTheDocument();
        expect(requester.getByText('Reason they gave').nextElementSibling).toHaveTextContent(
            'Not using it',
        );

        expect(section('Status').getByText('Due by').nextElementSibling).toHaveTextContent(
            '18 Dec 2026',
        );
        expect(await axeViolations(container)).toEqual([]);
    });

    it('goes back to the board', async () => {
        const { user, router } = await openPage([NEW], 'someone@example.com');
        await user.click(screen.getByRole('link', { name: /all deletion requests/i }));
        expect(router.state.location.pathname).toBe('/deletion-requests');
    });

    it('moves the request with its column select', async () => {
        const { fetch, user } = await openPage([NEW], 'someone@example.com');

        // One select for phones (in the header), one for wide screens (in Status).
        const [select] = screen.getAllByRole('combobox', { name: 'Column' });
        await user.selectOptions(select, 'awaiting-confirmation');

        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: NEW.id, status: 'awaiting-confirmation' }]),
        );
    });

    it('walks a new request through step 1: the email to write, then moving it on', async () => {
        const { fetch, user } = await openPage([NEW], 'someone@example.com');

        const step1 = screen.getByRole('heading', { name: 'Check it’s them' }).closest('li')!;
        expect(step1).toHaveAttribute('aria-current', 'step');
        expect(
            within(step1).getByRole('link', { name: 'Write the email' }).getAttribute('href'),
        ).toBe(confirmEmail(NEW, 'within 30 days').href);

        // The later steps wait until it's awaiting confirmation.
        expect(screen.queryByRole('button', { name: /mark as done/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /sql editor/i })).not.toBeInTheDocument();

        await user.click(within(step1).getByRole('button', { name: /i’ve emailed them/i }));
        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: NEW.id, status: 'awaiting-confirmation' }]),
        );
    });

    it('gives awaiting requests the SQL, the done email and Mark as done', async () => {
        const { fetch, user } = await openPage([URGENT], 'urgent@example.com');

        const editor = screen.getByRole('link', { name: /open the sql editor/i });
        expect(editor).toHaveAttribute('href', SQL_EDITOR);
        expect(editor).toHaveAttribute('target', '_blank');

        const writeText = vi.spyOn(navigator.clipboard, 'writeText');
        await user.click(screen.getByRole('button', { name: 'Copy the SQL' }));
        expect(writeText).toHaveBeenCalledWith(deletionSql('urgent@example.com'));

        const tell = screen
            .getByRole('heading', { name: 'Tell them, then close it' })
            .closest('li')!;
        expect(
            within(tell).getByRole('link', { name: 'Write the email' }).getAttribute('href'),
        ).toBe(doneEmail(URGENT).href);
        expect(section('Notes and history').getByText('Emailed to confirm')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /mark as done/i }));
        expect(window.confirm).toHaveBeenCalledWith('Mark this request as done?');
        await waitFor(() => expect(posts(fetch)).toEqual([{ id: URGENT.id, status: 'done' }]));
    });

    it('rejects a request that was never confirmed', async () => {
        const { fetch, user } = await openPage([URGENT], 'urgent@example.com');
        await user.click(screen.getByRole('button', { name: 'Reject it' }));
        await waitFor(() => expect(posts(fetch)).toEqual([{ id: URGENT.id, status: 'rejected' }]));
    });

    it('saves a note without moving the request', async () => {
        const { fetch, user } = await openPage([URGENT], 'urgent@example.com');
        const notes = section('Notes and history');

        expect(notes.getByRole('button', { name: 'Save note' })).toBeDisabled();
        await user.type(notes.getByLabelText(/^Add a note/), 'They replied');
        await user.click(notes.getByRole('button', { name: 'Save note' }));

        await waitFor(() =>
            expect(posts(fetch)).toEqual([
                { id: URGENT.id, status: 'awaiting-confirmation', note: 'They replied' },
            ]),
        );
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it('shows a done request as all done', async () => {
        await openPage([DONE], 'done@example.com');
        expect(screen.getByRole('heading', { name: 'All done' })).toBeInTheDocument();
        expect(section('Status').getByText('Closed').nextElementSibling).toHaveTextContent(
            '17 Nov 2026',
        );
    });

    it('shows a rejected request as closed, with a way to reopen it', async () => {
        const { fetch, user } = await openPage([REJECTED], 'Email removed');

        expect(section('Requester').getByText(/Removed 30 days after/)).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Copy email address' }),
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Reopen' }));
        await waitFor(() =>
            expect(posts(fetch)).toEqual([{ id: REJECTED.id, status: 'awaiting-confirmation' }]),
        );
    });

    it('shows why a change didn’t save', async () => {
        const fetch = api([URGENT], { status: 400, body: { error: 'Invalid change.' } });
        const { user } = renderAdmin(`/deletion-requests/${URGENT.id}`);

        await user.click(await screen.findByRole('button', { name: 'Reject it' }));
        expect(await screen.findByText('Invalid change.')).toBeInTheDocument();
        expect(posts(fetch)).toHaveLength(1);
    });

    it('says so when the server can’t be reached to save', async () => {
        const fetch = api([URGENT]);
        const { user } = renderAdmin(`/deletion-requests/${URGENT.id}`);
        await screen.findByRole('button', { name: 'Reject it' });

        fetch.mockImplementation(async (url: string, init: RequestInit = {}) => {
            if (init.method === 'POST') throw new Error('offline');
            if (url.endsWith('/me')) return Response.json({ signedIn: true, expiresAt: NOW });
            return Response.json({ requests: [URGENT], now: NOW, sqlEditorUrl: SQL_EDITOR });
        });
        await user.click(screen.getByRole('button', { name: 'Reject it' }));

        expect(
            await screen.findByText('Couldn’t reach the server. Try again.'),
        ).toBeInTheDocument();
    });

    it('says when there’s no such request', async () => {
        api([NEW]);
        renderAdmin('/deletion-requests/nope');
        expect(
            await screen.findByRole('heading', { level: 1, name: 'Request not found' }),
        ).toBeInTheDocument();
    });

    it('says when the requests couldn’t be loaded', async () => {
        api(null);
        renderAdmin(`/deletion-requests/${NEW.id}`);
        expect(
            await screen.findByRole('heading', { level: 1, name: 'Couldn’t load the request' }),
        ).toBeInTheDocument();
    });

    it('takes old side-panel links (?request=) to the page', async () => {
        api([NEW]);
        const { router } = renderAdmin(`/deletion-requests?request=${NEW.id}`);
        await screen.findByRole('heading', { level: 1, name: 'Deletion request' });
        expect(router.state.location.pathname).toBe(`/deletion-requests/${NEW.id}`);
    });
});

describe('finding requests when there are lots', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    /** `count` new requests, received a minute apart, the first due soonest. */
    const many = (count: number) =>
        Array.from({ length: count }, (_, i) =>
            request({
                id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
                email: `person${i}@example.com`,
                receivedAt: NOW - 10 * DAY + i * 60_000,
                dueAt: NOW + 20 * DAY + i * 60_000,
            }),
        );

    const cardsIn = (name: RegExp) =>
        within(screen.getByRole('region', { name }))
            .queryAllByRole('heading', { level: 3 })
            .map((heading) => heading.textContent);

    it('searches by email, reason or note as you type, and keeps it in the address', async () => {
        api([NEW, URGENT, DONE]);
        const { user, router } = renderAdmin('/deletion-requests');

        const search = await screen.findByRole('searchbox', { name: 'Search requests' });
        await user.type(search, 'urgent');

        expect(router.state.location.search).toBe('?q=urgent');
        expect(screen.getByText(/^Showing/)).toHaveTextContent('Showing 1 of 3 requests');
        expect(cardsIn(/^Awaiting confirmation/)).toEqual(['urgent@example.com']);
        // Only columns with matches show while searching.
        expect(screen.queryByRole('region', { name: /^New/ })).not.toBeInTheDocument();

        // A note matches too, and every word has to.
        await user.clear(search);
        await user.type(search, 'emailed CONFIRM');
        expect(cardsIn(/^Awaiting confirmation/)).toEqual(['urgent@example.com']);
        await user.type(search, ' nothing-like-this');
        expect(screen.getByText(/^Showing/)).toHaveTextContent('Showing 0 of 3 requests');
        expect(screen.getByText('No requests match that search.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Clear search' }));
        expect(router.state.location.search).toBe('');
        expect(cardsIn(/^New/)).toEqual(['someone@example.com']);
        expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
    });

    it('opens with the search from the address', async () => {
        api([NEW, URGENT]);
        renderAdmin('/deletion-requests?q=someone');

        expect(await screen.findByRole('searchbox', { name: 'Search requests' })).toHaveValue(
            'someone',
        );
        expect(cardsIn(/^New/)).toEqual(['someone@example.com']);
        expect(
            screen.queryByRole('region', { name: /^Awaiting confirmation/ }),
        ).not.toBeInTheDocument();
    });

    it('sorts open requests by due date, newest or oldest', async () => {
        api(many(3));
        const { user, router } = renderAdmin('/deletion-requests');

        await screen.findByRole('searchbox', { name: 'Search requests' });
        expect(cardsIn(/^New/)).toEqual([
            'person0@example.com',
            'person1@example.com',
            'person2@example.com',
        ]);

        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Sort open requests' }),
            'newest',
        );
        expect(router.state.location.search).toBe('?sort=newest');
        expect(cardsIn(/^New/)).toEqual([
            'person2@example.com',
            'person1@example.com',
            'person0@example.com',
        ]);

        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Sort open requests' }),
            'due',
        );
        expect(router.state.location.search).toBe('');
    });

    it('ignores a sort it doesn’t know', async () => {
        api(many(2));
        renderAdmin('/deletion-requests?sort=nonsense');
        expect(await screen.findByRole('combobox', { name: 'Sort open requests' })).toHaveValue(
            'due',
        );
    });

    it('shows 20 cards a column at first, and more on request', async () => {
        api(many(45));
        const { user } = renderAdmin('/deletion-requests');

        await screen.findByRole('searchbox', { name: 'Search requests' });
        expect(cardsIn(/^New/)).toHaveLength(20);

        await user.click(screen.getByRole('button', { name: /show 20 more \(25 hidden\)/i }));
        expect(cardsIn(/^New/)).toHaveLength(40);

        await user.click(screen.getByRole('button', { name: /show 5 more \(5 hidden\)/i }));
        expect(cardsIn(/^New/)).toHaveLength(45);
        expect(screen.queryByRole('button', { name: /show .* more/i })).not.toBeInTheDocument();
    });
});

describe('the help each request comes with', () => {
    it('matches a search on every word, in any field, whatever the case', () => {
        expect(matches(URGENT, '')).toBe(true);
        expect(matches(URGENT, 'URGENT example')).toBe(true);
        expect(matches(URGENT, 'emailed')).toBe(true);
        expect(matches(NEW, 'not using')).toBe(true);
        expect(matches(NEW, 'tracker')).toBe(true);
        expect(matches(NEW, 'someone nope')).toBe(false);
        expect(matches(REJECTED, 'someone')).toBe(false);
    });

    it('sorts closed requests latest first, whatever the sort', () => {
        const older = request({ id: 'a', status: 'done', closedAt: NOW - 5 * DAY });
        const newer = request({ id: 'b', status: 'done', closedAt: NOW - DAY });
        expect(sortRequests([older, newer], 'oldest').map((r) => r.id)).toEqual(['b', 'a']);
    });

    it('lets long emails wrap after the @ and the dots, not mid-word', () => {
        const { container } = render(<Email address='first.last@example.co.uk' />);
        expect(container).toHaveTextContent('first.last@example.co.uk');
        expect(container.querySelectorAll('wbr')).toHaveLength(4);
    });

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
