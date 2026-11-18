import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { clearCache } from '../cache.ts';
import { resetCollapsed } from '../collapsed.ts';
import { adminRoutes } from '../routes.tsx';
import { openMenu } from './menu.ts';

// The dashboard's navbar is built as the site's: the wordmark, a yellow button and the menu
// button, opening the same full-screen menu with the dashboard's sections.

afterEach(() => {
    clearCache();
    resetCollapsed();
    vi.unstubAllGlobals();
});

const NOW = Date.UTC(2026, 10, 18, 14);

const api = () =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me')) {
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            }
            if (url.endsWith('/deletion-requests')) {
                return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
            }
            return Response.json({}, { status: 500 });
        }),
    );

const renderAdmin = (path = '/') =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

describe('the dashboard’s navbar', () => {
    it('has the wordmark, with "admin" as part of the name, linking to the Overview', async () => {
        api();
        renderAdmin('/website');
        const navbar = within(await screen.findByRole('navigation', { name: 'Admin' }));

        const logo = navbar.getByRole('link', { name: 'ijji labs admin' });
        expect(logo).toHaveAttribute('href', '/');
        expect(logo).toHaveClass('font-newsreader');
        expect(within(logo).getByText('admin')).toHaveClass('text-brand-primary');
    });

    it('is on the sign-in page too, with just the wordmark', async () => {
        api();
        renderAdmin('/sign-in');
        await screen.findByRole('heading', { level: 1, name: 'Admin sign-in' });

        const banner = within(screen.getByRole('banner'));
        expect(banner.getByRole('link', { name: 'ijji labs admin' })).toHaveAttribute('href', '/');
        // Nothing to open or sign out of yet.
        expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    });

    it('opens the sections’ menu, and closes it with Esc, back on the menu button', async () => {
        const user = userEvent.setup();
        api();
        const { container } = renderAdmin('/');
        const { sections, menu } = await openMenu();

        expect(sections.getAllByRole('link').map((link) => link.textContent)).toEqual([
            expect.stringContaining('Overview'),
            expect.stringContaining('Website'),
            expect.stringContaining('Supabase'),
            expect.stringContaining('Deletions'),
        ]);
        // The page you're on, and where nothing needs doing.
        expect(sections.getByRole('link', { name: /Overview/ })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(sections.getByRole('link', { name: /Deletions/ })).toHaveTextContent(
            'Nothing to do',
        );
        expect(menu.getByText(/^Signed in until \d\d:\d\d$/)).toBeInTheDocument();
        expect(await axeViolations(container)).toEqual([]);

        await user.keyboard('{Escape}');
        const button = screen.getByRole('button', { name: 'Open menu' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveFocus();
    });
});
