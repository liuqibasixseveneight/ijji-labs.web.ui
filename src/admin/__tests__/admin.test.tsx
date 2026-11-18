import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { adminRoutes } from '../routes.tsx';
import { clearCache } from '../cache.ts';

// The dashboard keeps loaded data in memory for a minute: each test starts without it.
afterEach(() => clearCache());

type Reply = { status: number; body?: object };

/** Pretends to be the /api/admin/* functions; records each call. */
const api = (replies: Record<string, Reply | Reply[]>) => {
    const fetch = vi.fn(async (url: string, init: RequestInit = {}) => {
        const key = `${init.method ?? 'GET'} ${url}`;
        const reply = replies[key];
        const next = Array.isArray(reply) ? reply.shift()! : reply;
        if (!next) throw new Error(`Unexpected ${key}`);
        return new Response(JSON.stringify(next.body ?? {}), { status: next.status });
    });
    vi.stubGlobal('fetch', fetch);
    return fetch;
};

const SIGNED_IN: Reply = {
    status: 200,
    body: { signedIn: true, expiresAt: Date.UTC(2026, 10, 17, 18, 30) },
};
const SIGNED_OUT: Reply = { status: 401, body: { error: 'Not signed in.' } };

const renderAdmin = (path = '/') => {
    const router = createMemoryRouter(adminRoutes, { initialEntries: [path] });
    const user = userEvent.setup();
    return { router, user, ...render(<RouterProvider router={router} />) };
};

const fillIn = async (user: ReturnType<typeof userEvent.setup>, code = '123456') => {
    await user.type(screen.getByLabelText(/email address/i), 'admin@ijji-labs.com');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    if (code) await user.type(screen.getByLabelText(/authenticator code/i), code);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
};

describe('the admin dashboard', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => vi.unstubAllGlobals());

    it('sends you to sign in when you aren’t', async () => {
        api({ 'GET /api/admin/me': SIGNED_OUT });
        const { router } = renderAdmin('/');

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Admin sign-in' }),
        ).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/sign-in');
    });

    it('sends you to sign in when the server can’t be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderAdmin('/');
        expect(await screen.findByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument();
    });

    it('has an accessible sign-in page, named and never indexed', async () => {
        const { container } = renderAdmin('/sign-in');
        await screen.findByRole('heading', { name: 'Admin sign-in' });

        expect(document.title).toBe('Sign in · Admin · ijji labs');
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
            'content',
            'noindex, nofollow',
        );
        expect(await axeViolations(container)).toEqual([]);
    });

    it('signs in with the admin header, then shows the overview', async () => {
        const fetch = api({
            'POST /api/admin/session': { status: 200, body: { success: true } },
            'GET /api/admin/me': SIGNED_IN,
        });
        const { user, router } = renderAdmin('/sign-in');

        await fillIn(user);

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Overview' }),
        ).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');

        const init = fetch.mock.calls[0][1]!;
        expect(init.headers).toMatchObject({ 'X-Admin-Request': '1' });
        expect(init.credentials).toBe('same-origin');
        expect(JSON.parse(init.body as string)).toMatchObject({
            email: 'admin@ijji-labs.com',
            password: 'pw',
            code: '123456',
        });
    });

    it('shows the server’s refusal, and stays put', async () => {
        api({
            'POST /api/admin/session': {
                status: 401,
                body: { error: 'Those details didn’t work.' },
            },
        });
        const { user, router } = renderAdmin('/sign-in');

        await fillIn(user);

        expect(await screen.findByText('Those details didn’t work.')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/sign-in');
    });

    it('says so when the server can’t be reached, or answers oddly', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const { user } = renderAdmin('/sign-in');
        await fillIn(user);
        expect(
            await screen.findByText('Couldn’t reach the server. Try again.'),
        ).toBeInTheDocument();

        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('oops', { status: 502 })),
        );
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
    });

    it('checks the form before sending', async () => {
        const fetch = api({});
        const { user } = renderAdmin('/sign-in');

        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText('Enter your email address')).toBeInTheDocument();
        expect(screen.getByText('Enter your password')).toBeInTheDocument();

        await user.type(screen.getByLabelText(/authenticator code/i), '12');
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(
            await screen.findByText('Enter the 6-digit code from your authenticator app'),
        ).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('sets up an authenticator the first time, then confirms it', async () => {
        const fetch = api({
            'POST /api/admin/session': [
                {
                    status: 200,
                    body: {
                        enrol: {
                            factorId: '44444444-4444-4444-8444-444444444444',
                            qrCode: 'data:image/svg+xml;utf-8,<svg/>',
                            secret: 'SECRETKEY',
                        },
                    },
                },
                { status: 200, body: { success: true } },
            ],
            'GET /api/admin/me': SIGNED_IN,
        });
        const { user } = renderAdmin('/sign-in');

        await fillIn(user, '');
        expect(await screen.findByRole('img', { name: /qr code/i })).toHaveAttribute(
            'src',
            'data:image/svg+xml;utf-8,<svg/>',
        );
        expect(screen.getByText('SECRETKEY')).toBeInTheDocument();

        await user.type(screen.getByLabelText(/authenticator code/i), '654321');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByRole('heading', { name: 'Overview' })).toBeInTheDocument();
        expect(JSON.parse(fetch.mock.calls[1][1]!.body as string)).toMatchObject({
            code: '654321',
            factorId: '44444444-4444-4444-8444-444444444444',
        });
    });

    it('shows how long the session lasts, and has no accessibility problems', async () => {
        api({ 'GET /api/admin/me': SIGNED_IN });
        const { container } = renderAdmin('/');

        expect(await screen.findByText(/^Signed in until \d\d:\d\d\.$/)).toBeInTheDocument();
        expect(document.title).toBe('Overview · Admin · ijji labs');
        expect(await axeViolations(container)).toEqual([]);
    });

    it.each([
        ['Sign out', 'banner', 'DELETE /api/admin/session'],
        // In the header from tablets up; on the Overview on phones.
        ['Sign out everywhere', 'banner', 'DELETE /api/admin/session?everywhere=1'],
        ['Sign out everywhere', 'main', 'DELETE /api/admin/session?everywhere=1'],
    ] as const)(
        '%s (in the %s) ends the session and goes back to sign in',
        async (name, where, call) => {
            const fetch = api({ 'GET /api/admin/me': SIGNED_IN, [call]: { status: 200 } });
            const { user, router } = renderAdmin('/');

            const area = within(await screen.findByRole(where));
            await user.click(area.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }));

            await waitFor(() => expect(router.state.location.pathname).toBe('/sign-in'));
            expect(
                fetch.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${url}`),
            ).toContain(call);
        },
    );

    it('signs out even if the server can’t be reached', async () => {
        const fetch = vi.fn(async (url: string, init: RequestInit = {}) => {
            if (init.method === 'DELETE') throw new Error('offline');
            if (url.endsWith('deletion-requests')) return new Response('{}', { status: 500 });
            return new Response(JSON.stringify(SIGNED_IN.body), { status: 200 });
        });
        vi.stubGlobal('fetch', fetch);
        const { user, router } = renderAdmin('/');

        await user.click(await screen.findByRole('button', { name: /^sign out$/i }));
        await waitFor(() => expect(router.state.location.pathname).toBe('/sign-in'));
    });

    it('has a page-not-found of its own', async () => {
        api({ 'GET /api/admin/me': SIGNED_IN });
        renderAdmin('/nope');
        expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    });

    it('is not a page of the public site', async () => {
        renderApp('/admin');
        expect(
            await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
        ).toBeInTheDocument();
        expect(screen.queryByText('Admin sign-in')).not.toBeInTheDocument();
    });
});
