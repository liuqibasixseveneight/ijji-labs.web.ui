import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { DAY, describeDaysLeft, urgency, type DeletionRequest } from '../deletionRequests.ts';
import { adminRoutes } from '../routes.tsx';

const NOW = Date.UTC(2026, 10, 20, 12);

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
    email: null,
    status: 'done',
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
        if (init.method === 'POST')
            return Response.json(change.body ?? {}, { status: change.status });
        return requests
            ? Response.json({ requests, now: NOW })
            : Response.json({ error: 'Not allowed.' }, { status: 500 });
    });
    vi.stubGlobal('fetch', fetch);
    return fetch;
};

const renderAdmin = (path: string) => {
    const router = createMemoryRouter(adminRoutes, { initialEntries: [path] });
    return { router, user: userEvent.setup(), ...render(<RouterProvider router={router} />) };
};

const card = (email: string) =>
    screen.getByRole('heading', { level: 3, name: email }).closest('li')!;

describe('deletion requests in the dashboard', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('show how many are open in the nav and on the Overview', async () => {
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

    it('say there’s nothing to do when none are open', async () => {
        api([DONE]);
        renderAdmin('/');

        expect(await screen.findByText('0 open')).toBeInTheDocument();
        expect(screen.getByText('Nothing to do.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Deletion requests' })).toBeInTheDocument();
    });

    it('list the open ones with what’s needed, and the closed ones underneath', async () => {
        api([URGENT, NEW, DONE]);
        const { container } = renderAdmin('/deletion-requests');

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Deletion requests' }),
        ).toBeInTheDocument();
        expect(document.title).toBe('Deletion requests · Admin · ijji labs');
        expect(screen.getByRole('heading', { name: 'Open (2)' })).toBeInTheDocument();

        const urgent = card('urgent@example.com');
        expect(within(urgent).getByText('2 days left')).toHaveClass('bg-red-100');
        expect(
            within(urgent).getByText('Awaiting confirmation', { selector: 'dd' }),
        ).toBeInTheDocument();
        expect(within(urgent).getByText(/Emailed to confirm/)).toBeInTheDocument();

        expect(within(card('someone@example.com')).getByText('Not using it')).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Closed (1)' })).toBeInTheDocument();
        expect(screen.getByText('Email removed')).toBeInTheDocument();

        expect(await axeViolations(container)).toEqual([]);
    });

    it('move a request on, with a note, then reload', async () => {
        const fetch = api([NEW]);
        const { user } = renderAdmin('/deletion-requests');

        const form = within(await screen.findByRole('form', { name: 'someone@example.com' }));
        await user.selectOptions(form.getByLabelText(/^Move to/), 'awaiting-confirmation');
        await user.type(form.getByLabelText(/^Note \(optional\)/), 'Emailed them');
        await user.click(form.getByRole('button', { name: /save/i }));

        await waitFor(() =>
            expect(fetch.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
        );
        const [url, init] = fetch.mock.calls.find(([, i]) => i?.method === 'POST')!;
        expect(url).toBe('/api/admin/deletion-requests');
        expect(init!.headers).toMatchObject({ 'X-Admin-Request': '1' });
        expect(JSON.parse(init!.body as string)).toEqual({
            id: NEW.id,
            status: 'awaiting-confirmation',
            note: 'Emailed them',
        });

        // The list is fetched again after saving.
        await waitFor(() =>
            expect(fetch.mock.calls.filter(([u]) => u.endsWith('deletion-requests'))).toHaveLength(
                3,
            ),
        );
    });

    it('ask before closing a request, and do nothing if you say no', async () => {
        const fetch = api([NEW]);
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { user } = renderAdmin('/deletion-requests');

        const form = within(await screen.findByRole('form', { name: 'someone@example.com' }));
        await user.selectOptions(form.getByLabelText(/^Move to/), 'done');
        await user.click(form.getByRole('button', { name: /save/i }));

        expect(confirm).toHaveBeenCalledWith('Mark this request as done?');
        expect(fetch.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);

        confirm.mockReturnValue(true);
        await user.click(form.getByRole('button', { name: /save/i }));
        await waitFor(() =>
            expect(fetch.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
        );
    });

    it('show why a change didn’t save', async () => {
        api([NEW], { status: 400, body: { error: 'Invalid change.' } });
        const { user } = renderAdmin('/deletion-requests');

        const form = within(await screen.findByRole('form', { name: 'someone@example.com' }));
        await user.selectOptions(form.getByLabelText(/^Move to/), 'awaiting-confirmation');
        await user.click(form.getByRole('button', { name: /save/i }));

        expect(await form.findByText('Invalid change.')).toBeInTheDocument();
    });

    it('say so when the server can’t be reached to save', async () => {
        const fetch = api([NEW]);
        const { user } = renderAdmin('/deletion-requests');
        const form = within(await screen.findByRole('form', { name: 'someone@example.com' }));

        fetch.mockImplementation(async (url: string, init: RequestInit = {}) => {
            if (init.method === 'POST') throw new Error('offline');
            if (url.endsWith('/me')) return Response.json({ signedIn: true, expiresAt: NOW });
            return Response.json({ requests: [NEW], now: NOW });
        });
        await user.selectOptions(form.getByLabelText(/^Move to/), 'awaiting-confirmation');
        await user.click(form.getByRole('button', { name: /save/i }));

        expect(
            await screen.findByText('Couldn’t reach the server. Try again.'),
        ).toBeInTheDocument();
    });

    it('say so when they can’t be loaded', async () => {
        api(null);
        renderAdmin('/deletion-requests');

        expect(await screen.findByText('Couldn’t load the requests')).toBeInTheDocument();
    });

    it('say so on the Overview when they can’t be loaded', async () => {
        api(null);
        renderAdmin('/');

        expect(
            await screen.findByText('Couldn’t load them. Open the page to try again.'),
        ).toBeInTheDocument();
    });

    it('show empty lists plainly', async () => {
        api([]);
        renderAdmin('/deletion-requests');

        expect(await screen.findByText('Nothing to do.')).toBeInTheDocument();
        expect(screen.getByText('None yet.')).toBeInTheDocument();
    });
});

describe('how long a request has left', () => {
    it.each([
        [12, '12 days left', 'fine'],
        [9, '9 days left', 'soon'],
        [1, '1 day left', 'urgent'],
        [0, 'Due today', 'urgent'],
        [-1, '1 day overdue', 'urgent'],
        [-4, '4 days overdue', 'urgent'],
    ])('%i days: "%s", %s', (days, text, level) => {
        expect(describeDaysLeft(days)).toBe(text);
        expect(urgency(days)).toBe(level);
    });
});
