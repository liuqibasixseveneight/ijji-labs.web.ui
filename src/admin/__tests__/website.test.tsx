import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { adminRoutes } from '../routes.tsx';
import { deployStatus, lastDays, scoreLevel, type Counts, type Website } from '../website.ts';

const NOW = Date.UTC(2026, 10, 20, 12);
const DAY = 24 * 60 * 60 * 1000;

const CHECKS = [
    ['Home', '/'],
    ['IJJI Tracker privacy policy', '/apps/ijji-tracker/privacy'],
];

const counts = (sent: number, extra: Partial<Counts> = {}): Counts => ({
    sent,
    invalid: 0,
    bot: 0,
    failed: 0,
    ...extra,
});

const website = (overrides: Partial<Website> = {}): Website => ({
    now: NOW,
    uptime: {
        data: CHECKS.map(([name, path], i) => ({
            name,
            path,
            latest: { path, ok: i === 0, status: i === 0 ? 200 : 500, ms: 120 },
            lastCheckedAt: NOW,
            uptime24h: i === 0 ? 100 : 97.9,
            uptime7d: i === 0 ? 100 : 99.7,
            averageMs24h: 150,
            recent: [
                { at: NOW - 600_000, ok: true, ms: 110 },
                { at: NOW, ok: i === 0, ms: 120 },
            ],
        })),
        error: null,
    },
    lighthouse: {
        data: [
            {
                page: 'Home',
                path: '/',
                strategy: 'mobile',
                latest: {
                    date: '2026-11-20',
                    at: NOW,
                    scores: { performance: 88, accessibility: 100, 'best-practices': 100, seo: 45 },
                },
                history: [
                    {
                        date: '2026-11-19',
                        at: NOW - DAY,
                        scores: {
                            performance: 91,
                            accessibility: 100,
                            'best-practices': 100,
                            seo: 100,
                        },
                    },
                    {
                        date: '2026-11-20',
                        at: NOW,
                        scores: {
                            performance: 88,
                            accessibility: 100,
                            'best-practices': 100,
                            seo: 45,
                        },
                    },
                ],
            },
            { page: 'Home', path: '/', strategy: 'desktop', latest: null, history: [] },
        ],
        error: null,
    },
    deploys: {
        data: [
            {
                id: 'd1',
                state: 'ready',
                context: 'production',
                branch: 'master',
                title: 'Merge develop into master',
                commitRef: 'abc1234def',
                createdAt: '2026-11-20T10:00:00Z',
                publishedAt: null,
                deployTime: 51,
                errorMessage: null,
                adminUrl: 'https://app.netlify.com/sites/ijji-labs/deploys/d1',
            },
            {
                id: 'd2',
                state: 'error',
                context: 'deploy-preview',
                branch: 'feat/x',
                title: null,
                commitRef: 'fff0000aaa',
                createdAt: '2026-11-19T10:00:00Z',
                publishedAt: null,
                deployTime: null,
                errorMessage: 'Build script returned non-zero exit code: 2',
                adminUrl: 'https://app.netlify.com/sites/ijji-labs/deploys/d2',
            },
        ],
        error: null,
    },
    forms: {
        data: {
            days: Array.from({ length: 30 }, (_, i) =>
                new Date(NOW - (29 - i) * DAY).toISOString().slice(0, 10),
            ),
            forms: {
                contact: {
                    byDay: Array.from({ length: 30 }, (_, i) =>
                        i === 29 ? counts(3, { bot: 1 }) : i === 10 ? counts(5) : counts(0),
                    ),
                    total: counts(8, { bot: 1 }),
                },
                'account-deletion': {
                    byDay: Array.from({ length: 30 }, () => counts(0)),
                    total: counts(0),
                },
            },
        },
        error: null,
    },
    ...overrides,
});

const api = (data: Website | null) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me'))
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            if (url.endsWith('/website')) {
                return data ? Response.json(data) : Response.json({}, { status: 500 });
            }
            return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
        }),
    );

const renderAdmin = (path: string) =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

const section = (name: string) => within(screen.getByRole('region', { name }));

describe('the website page', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('is in the nav, and accessible', async () => {
        api(website());
        const { container } = renderAdmin('/website');

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Website' }),
        ).toBeInTheDocument();
        expect(document.title).toBe('Website · Admin · ijji labs');
        expect(
            within(screen.getByRole('navigation', { name: 'Admin' })).getByRole('link', {
                name: 'Website',
            }),
        ).toHaveAttribute('aria-current', 'page');
        expect(await axeViolations(container)).toEqual([]);
    });

    it('shows each page as up or down, with its uptime and recent checks', async () => {
        api(website());
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Uptime' });

        const [home, privacy] = section('Uptime').getAllByRole('listitem');
        expect(home).toHaveTextContent('Up');
        expect(home).toHaveTextContent('100% over 24h · 100% over 7 days · 150 ms average');
        expect(privacy).toHaveTextContent('Down');
        expect(privacy).toHaveTextContent('last answer: 500');
        expect(
            within(privacy).getByRole('img', { name: 'Last 2 checks: 1 passed, 1 failed' }),
        ).toBeInTheDocument();
    });

    it('shows Lighthouse scores with their band, a dash before the first run, and the trend', async () => {
        api(website());
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Lighthouse' });

        const [, mobile, desktop] = section('Lighthouse').getAllByRole('row');
        expect(within(mobile).getByText('88')).toBeInTheDocument();
        expect(mobile).toHaveTextContent('Needs work');
        expect(mobile).toHaveTextContent('Poor');
        expect(
            within(mobile).getByRole('img', { name: /performance over 30 days: 91, 88/ }),
        ).toBeInTheDocument();
        expect(within(desktop).getAllByText('—')).toHaveLength(4);
    });

    it('lists deploys with their state, linking to Netlify', async () => {
        api(website());
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Deploys' });

        const [published, failed] = section('Deploys').getAllByRole('listitem');
        expect(published).toHaveTextContent('Published');
        expect(published).toHaveTextContent('production · master · abc1234');
        expect(
            within(published).getByRole('link', { name: /Merge develop into master/ }),
        ).toHaveAttribute('href', 'https://app.netlify.com/sites/ijji-labs/deploys/d1');
        expect(failed).toHaveTextContent('Failed');
        expect(failed).toHaveTextContent('Build script returned non-zero exit code: 2');
        expect(within(failed).getByRole('link', { name: /fff0000/ })).toBeInTheDocument();
    });

    it('counts form posts for the last week and month, with a table behind the chart', async () => {
        api(website());
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Forms' });

        const forms = section('Forms');
        expect(forms.getByText('Last 7 days; 9 posts in 30 days.')).toBeInTheDocument();
        expect(
            forms.getByRole('table', { name: 'Contact form posts per day' }),
        ).toBeInTheDocument();
        expect(
            forms.getByRole('table', { name: 'Delete account form posts per day' }),
        ).toBeInTheDocument();
    });

    it('says why a part is missing, and shows the rest', async () => {
        api(
            website({
                deploys: { data: null, error: 'NETLIFY_API_TOKEN isn’t set in Netlify yet.' },
                lighthouse: {
                    data: [
                        { page: 'Home', path: '/', strategy: 'mobile', latest: null, history: [] },
                    ],
                    error: null,
                },
            }),
        );
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Deploys' });

        expect(
            section('Deploys').getByText('NETLIFY_API_TOKEN isn’t set in Netlify yet.'),
        ).toBeInTheDocument();
        expect(
            section('Lighthouse').getByText('No scores yet: the first runs at 03:00 UTC.'),
        ).toBeInTheDocument();
        expect(section('Uptime').getAllByRole('listitem')).toHaveLength(2);
    });

    it('says when nothing could be loaded', async () => {
        api(null);
        renderAdmin('/website');
        expect(
            await screen.findByText('Couldn’t load the website’s data. Reload to try again.'),
        ).toBeInTheDocument();
    });
});

describe('the website card on the Overview', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const card = async () =>
        within(within(await screen.findByRole('main')).getByRole('link', { name: /^Website/ }));

    it('says how many pages are down, the last deploy and the mobile score', async () => {
        api(website());
        renderAdmin('/');
        const website_ = await card();
        expect(website_.getByText('1 down')).toBeInTheDocument();
        expect(website_.getByText('Published')).toBeInTheDocument();
        expect(website_.getByText('88 · Needs work')).toBeInTheDocument();
    });

    it('says all up, and says when nothing’s been checked yet', async () => {
        const up = website();
        up.uptime.data = up.uptime.data!.map((c) => ({ ...c, latest: { ...c.latest!, ok: true } }));
        api(up);
        const { unmount } = renderAdmin('/');
        expect((await card()).getByText('All up')).toBeInTheDocument();
        unmount();

        api(website({ uptime: { data: [], error: null }, deploys: { data: null, error: 'x' } }));
        renderAdmin('/');
        expect((await card()).getByText('Not checked yet')).toBeInTheDocument();
    });

    it('says when it couldn’t load', async () => {
        api(null);
        renderAdmin('/');
        expect(
            (await card()).getByText('Couldn’t load it. Open the page to try again.'),
        ).toBeInTheDocument();
    });
});

describe('the website helpers', () => {
    it('band Lighthouse scores as Lighthouse does', () => {
        expect([100, 90, 89, 50, 49].map(scoreLevel)).toEqual([
            'good',
            'good',
            'warning',
            'warning',
            'critical',
        ]);
    });

    it('name deploy states', () => {
        expect(
            ['ready', 'error', 'building', 'enqueued', 'cancelled'].map(
                (s) => deployStatus(s).label,
            ),
        ).toEqual(['Published', 'Failed', 'Building', 'Building', 'Cancelled']);
    });

    it('add up the last days', () => {
        expect(lastDays([counts(1), counts(2, { bot: 1 }), counts(3)], 2)).toEqual(
            counts(5, { bot: 1 }),
        );
    });
});
