import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRoutes } from '../routes.tsx';
import { sectionLink } from './menu.ts';
import { clearCache } from '../cache.ts';
import { resetCollapsed } from '../collapsed.ts';

// The dashboard keeps loaded data for a minute, and remembers collapsed cards: each test
// starts without either.
afterEach(() => {
    clearCache();
    resetCollapsed();
});

// How the dashboard feels to move around: pages appear at once with a skeleton, data is kept
// for a minute, links load ahead on hover, and the session isn't fetched again on every move.

const NOW = Date.UTC(2026, 10, 18, 14);

const website = {
    now: NOW,
    uptime: { data: [], error: null },
    lighthouse: { data: [], error: null },
    deploys: { data: [], error: null },
    forms: {
        data: {
            days: ['2026-11-18'],
            forms: {
                contact: {
                    byDay: [{ sent: 1, invalid: 0, bot: 0, failed: 0 }],
                    total: { sent: 1, invalid: 0, bot: 0, failed: 0 },
                },
                'account-deletion': {
                    byDay: [{ sent: 0, invalid: 0, bot: 0, failed: 0 }],
                    total: { sent: 0, invalid: 0, bot: 0, failed: 0 },
                },
            },
        },
        error: null,
    },
};

const none = { data: null, error: 'Not set up.' };
const supabase = (env: string) => ({
    env,
    now: NOW,
    ref: null,
    project: none,
    health: none,
    usage: none,
    database: none,
    security: none,
    performance: none,
    traffic: none,
});

/** The API, with each answer held until `release()` when `hold` is set. */
const api = ({ hold = false } = {}) => {
    const waiting: (() => void)[] = [];
    const answer = async (body: unknown) => {
        if (hold) await new Promise<void>((resolve) => waiting.push(resolve));
        return Response.json(body);
    };
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me'))
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            if (url.endsWith('/website')) return answer(website);
            if (url.includes('/supabase')) {
                return answer(supabase(url.includes('env=dev') ? 'dev' : 'prod'));
            }
            return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
        }),
    );
    return { release: () => waiting.splice(0).forEach((resolve) => resolve()) };
};

const calls = (part: string) =>
    vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes(part)).length;

const renderAdmin = (path: string) =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

describe('moving around the dashboard', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => vi.unstubAllGlobals());

    it('shows a page at once, as a skeleton, while its data loads', async () => {
        const { release } = api({ hold: true });
        renderAdmin('/website');

        // The page and its cards' titles are there before the data.
        expect(
            await screen.findByRole('heading', { level: 1, name: 'Website' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Uptime' })).toBeInTheDocument();
        expect(screen.getByText('Loading the website’s data…')).toBeInTheDocument();
        expect(screen.getByText('Updating…')).toBeInTheDocument();

        release();
        expect(await screen.findByRole('region', { name: 'Forms' })).toBeInTheDocument();
        expect(screen.queryByText('Loading the website’s data…')).not.toBeInTheDocument();
        expect(screen.getByText(/^Updated \d\d:\d\d$/)).toBeInTheDocument();
    });

    it('keeps a page’s data for a minute, so coming back is instant', async () => {
        const user = userEvent.setup();
        api();
        renderAdmin('/website');
        await screen.findByRole('region', { name: 'Forms' });

        await user.click(await sectionLink('Overview'));
        await screen.findByRole('heading', { level: 1, name: 'Overview' });
        await user.click(await sectionLink('Website'));

        // Straight back to the cards, with no skeleton and no second request.
        expect(await screen.findByRole('region', { name: 'Forms' })).toBeInTheDocument();
        expect(screen.queryByText('Loading the website’s data…')).not.toBeInTheDocument();
        expect(calls('/website')).toBe(1);
    });

    it('loads the sections’ data when the menu opens, ready for the click', async () => {
        const user = userEvent.setup();
        api();
        renderAdmin('/website');
        await screen.findByRole('region', { name: 'Forms' });
        expect(calls('/supabase')).toBe(0);

        // Opening the menu starts the load; the click then uses it rather than asking again.
        const link = await sectionLink('Supabase');
        expect(calls('/supabase?env=prod')).toBe(1);
        await user.click(link);
        expect(await screen.findByRole('region', { name: 'Production' })).toBeInTheDocument();
        expect(calls('/supabase?env=prod')).toBe(1);

        // The project tabs do the same.
        fireEvent.mouseEnter(screen.getByRole('link', { name: 'Develop' }));
        expect(calls('/supabase?env=dev')).toBe(1);
    });

    it('moves the project tab the moment it’s clicked', async () => {
        const user = userEvent.setup();
        const { release } = api({ hold: true });
        renderAdmin('/supabase');
        const tabs = within(await screen.findByRole('navigation', { name: 'Project' }));

        await user.click(tabs.getByRole('link', { name: 'Develop' }));

        // Before any data: the tab, and develop's skeleton.
        await waitFor(() =>
            expect(tabs.getByRole('link', { name: 'Develop' })).toHaveAttribute(
                'aria-current',
                'page',
            ),
        );
        expect(screen.getByText('Loading develop’s data…')).toBeInTheDocument();
        release();
    });

    it('loads again on Refresh', async () => {
        const user = userEvent.setup();
        api();
        renderAdmin('/website');
        await screen.findByRole('region', { name: 'Forms' });

        await user.click(screen.getByRole('button', { name: 'Refresh' }));

        await waitFor(() => expect(calls('/website')).toBe(2));
        expect(await screen.findByText(/^Updated \d\d:\d\d$/)).toBeInTheDocument();
    });

    it('doesn’t fetch the session and deletion requests again on every page or search', async () => {
        const user = userEvent.setup();
        api();
        renderAdmin('/');
        await screen.findByRole('heading', { level: 1, name: 'Overview' });
        expect(calls('/deletion-requests')).toBe(1);

        await user.click(await sectionLink('Website'));
        // The menu closes as each page opens: wait for it before opening the menu again.
        await screen.findByRole('heading', { level: 1, name: 'Website' });
        await user.click(await sectionLink('Deletions'));
        await user.type(await screen.findByRole('searchbox'), 'abc');

        expect(calls('/me')).toBe(1);
        expect(calls('/deletion-requests')).toBe(1);
    });
});
