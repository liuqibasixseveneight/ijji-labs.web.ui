import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { clearCache } from '../cache.ts';
import { resetCollapsed } from '../collapsed.ts';
import { adminRoutes } from '../routes.tsx';
import type { Supabase } from '../supabase.ts';

// Every card collapses from its title, says in a few words what's inside while it's closed,
// and stays as it was left; Collapse all closes (and Expand all opens) a page's cards.

afterEach(() => {
    clearCache();
    resetCollapsed();
});

const NOW = Date.UTC(2026, 10, 18, 14);
const none = { data: null, error: 'Not set up.' };

const supabase: Supabase = {
    env: 'prod',
    now: NOW,
    ref: 'abcdefghijklmnopqrst',
    project: {
        data: {
            name: 'ijji-tracker',
            region: 'eu-west-1',
            status: 'ACTIVE_HEALTHY',
            paused: false,
        },
        error: null,
    },
    health: none,
    usage: none,
    database: none,
    security: {
        data: [
            { name: 'a', title: 'Exposed thing', level: 'WARN', detail: 'x', remediation: null },
            { name: 'b', title: 'Another thing', level: 'WARN', detail: 'y', remediation: null },
            { name: 'c', title: 'Small thing', level: 'INFO', detail: 'z', remediation: null },
        ],
        error: null,
    },
    performance: { data: [], error: null },
    traffic: none,
};

const api = () =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me')) {
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            }
            if (url.includes('/supabase')) return Response.json(supabase);
            return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
        }),
    );

const renderAdmin = (path: string) =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

const toggle = (name: string) => screen.getByRole('button', { name });

describe('collapsing cards', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('closes a card from its title, with a summary, and nothing inside left to tab to', async () => {
        const user = userEvent.setup();
        api();
        renderAdmin('/supabase');
        const security = await screen.findByRole('region', { name: 'Security Advisor' });
        const button = toggle('Security Advisor');
        const body = document.getElementById(button.getAttribute('aria-controls')!)!;

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(body).not.toHaveAttribute('inert');
        expect(within(security).queryByText('2 warnings, 1 suggestion')).not.toBeInTheDocument();

        await user.click(button);

        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(body).toHaveAttribute('inert');
        expect(within(security).getByText('2 warnings, 1 suggestion')).toBeInTheDocument();

        // A card without data says so while closed, too.
        await user.click(toggle('People'));
        expect(
            within(screen.getByRole('region', { name: 'People' })).getAllByText('Not available'),
        ).toHaveLength(2);
    });

    it('stays as it was left, from one visit to the next', async () => {
        const user = userEvent.setup();
        api();
        const first = renderAdmin('/supabase');
        await screen.findByRole('region', { name: 'Security Advisor' });
        await user.click(toggle('Security Advisor'));
        first.unmount();

        renderAdmin('/supabase');
        await screen.findByRole('region', { name: 'Security Advisor' });
        expect(toggle('Security Advisor')).toHaveAttribute('aria-expanded', 'false');
        expect(toggle('Performance Advisor')).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses every card at once, and opens them all again', async () => {
        const user = userEvent.setup();
        api();
        const { container } = renderAdmin('/supabase');
        await screen.findByRole('region', { name: 'Security Advisor' });

        await user.click(screen.getByRole('button', { name: 'Collapse all' }));
        for (const name of ['Production', 'People', 'Security Advisor', 'API traffic']) {
            expect(toggle(name)).toHaveAttribute('aria-expanded', 'false');
        }
        expect(await axeViolations(container)).toEqual([]);

        await user.click(screen.getByRole('button', { name: 'Expand all' }));
        expect(toggle('People')).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Collapse all' })).toBeInTheDocument();
    });

    it('still works when the browser won’t store anything', async () => {
        const user = userEvent.setup();
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        api();
        renderAdmin('/supabase');
        await screen.findByRole('region', { name: 'Security Advisor' });

        await user.click(toggle('Security Advisor'));
        expect(toggle('Security Advisor')).toHaveAttribute('aria-expanded', 'false');
    });
});
