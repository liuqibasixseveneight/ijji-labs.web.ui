import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { adminRoutes } from '../routes.tsx';
import {
    deployStatus,
    describeMetrics,
    lastDays,
    scoreLevel,
    type Counts,
    type Website,
} from '../website.ts';

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
                key: 'home-mobile',
                page: 'Home',
                path: '/',
                strategy: 'mobile',
                manualAvailableAt: null,
                latest: {
                    date: '2026-11-20',
                    at: NOW,
                    scores: { performance: 88, accessibility: 100, 'best-practices': 100, seo: 45 },
                    metrics: { fcp: 1800, lcp: 1800, tbt: 1180, cls: 0, si: 6300 },
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
            {
                key: 'home-desktop',
                page: 'Home',
                path: '/',
                strategy: 'desktop',
                manualAvailableAt: null,
                latest: null,
                history: [],
            },
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

const api = (
    data: Website | null,
    lighthouse: (key: string) => Response | Promise<Response> = () => Response.json({}),
) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            if (url.endsWith('/me'))
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            if (url.endsWith('/lighthouse')) {
                return lighthouse(JSON.parse(String(init?.body)).key);
            }
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

    it('shows each page’s Lighthouse results: a ring, the other scores, plain-English timings and the trend', async () => {
        api(website());
        renderAdmin('/website');
        await screen.findByRole('heading', { name: 'Lighthouse' });

        // The page's block is named by its heading ("Home /"); its panels by page and device.
        const home = within(section('Lighthouse').getByRole('region', { name: 'Home /' }));
        const mobile = within(home.getByRole('region', { name: 'Home, mobile' }));

        // Performance as a ring, with its band in words.
        const ring = mobile.getByRole('figure', { name: 'Performance 88, needs work' });
        expect(ring).toHaveTextContent('88');
        expect(ring).toHaveTextContent('Needs work');

        // The other three as a list, each with its band for screen readers.
        expect(mobile.getByText('Accessibility').nextElementSibling).toHaveTextContent(
            '100 (good)',
        );
        expect(mobile.getByText('SEO').nextElementSibling).toHaveTextContent('45 (poor)');

        // Timings in plain words, a slow one marked.
        expect(mobile.getByText('Largest paint').closest('div')).toHaveTextContent('1.8 s');
        expect(mobile.getByText('Blocking time').closest('div')).toHaveTextContent(
            '1,180 ms (slow)',
        );
        expect(mobile.getByTitle('TBT')).toBeInTheDocument();

        expect(
            mobile.getByRole('img', { name: /performance over 2 days: 91, 88/ }),
        ).toBeInTheDocument();
        expect(mobile.getByText('88–91')).toBeInTheDocument();

        // A page or device not run yet says so.
        const desktop = within(home.getByRole('region', { name: 'Home, desktop' }));
        expect(desktop.getByText('Not run yet')).toBeInTheDocument();
        expect(
            desktop.getByText(/The daily run is at 03:00 UTC, or run it now/),
        ).toBeInTheDocument();
    });

    it('runs Lighthouse now, all at once, and shows the new scores as each finishes', async () => {
        const user = userEvent.setup();
        let finish: (() => void) | undefined;
        const done = new Promise<void>((resolve) => (finish = resolve));
        api(website(), async () => {
            await done;
            return Response.json({});
        });
        renderAdmin('/website');
        const lighthouse = within(
            (await screen.findByRole('heading', { name: 'Lighthouse' })).closest('section')!,
        );

        await user.click(lighthouse.getByRole('button', { name: 'Run all now' }));

        // Both run side by side; each panel says so, and can't be started twice.
        const posts = () =>
            vi
                .mocked(fetch)
                .mock.calls.filter(([url]) => String(url).endsWith('/lighthouse'))
                .map(([, init]) => JSON.parse(String(init?.body)).key);
        expect(posts()).toEqual(['home-mobile', 'home-desktop']);
        expect(lighthouse.getByRole('status')).toHaveTextContent('Running 2 side by side');
        const mobile = lighthouse.getByRole('region', { name: 'Home, mobile' });
        expect(mobile).toHaveAttribute('aria-busy', 'true');
        expect(within(mobile).getByRole('button', { name: 'Running Home, mobile' })).toBeDisabled();
        expect(lighthouse.getByRole('button', { name: 'Run all now' })).toBeDisabled();

        const loads = () =>
            vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith('/website')).length;
        const before = loads();
        finish!();

        // Done: the website's data is reloaded for the new scores.
        expect(await lighthouse.findByText('Done: the scores below are new.')).toBeInTheDocument();
        await waitFor(() => expect(loads()).toBeGreaterThan(before));
        expect(mobile).not.toHaveAttribute('aria-busy');
    });

    it('says why a run didn’t work, in its panel', async () => {
        const user = userEvent.setup();
        api(website(), () =>
            Response.json(
                { error: 'PageSpeed Insights’ quota is used up for now.' },
                { status: 502 },
            ),
        );
        renderAdmin('/website');
        const panel = within(await screen.findByRole('region', { name: 'Home, desktop' }));

        await user.click(panel.getByRole('button', { name: 'Run Home, desktop' }));

        expect(
            await panel.findByText('PageSpeed Insights’ quota is used up for now.'),
        ).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(
            'That didn’t run: the panel says why.',
        );
        // It can be tried again.
        expect(panel.getByRole('button', { name: 'Run Home, desktop' })).toBeEnabled();
    });

    it('can’t run a page again within 10 minutes of its last run', async () => {
        const data = website();
        data.lighthouse.data![0].manualAvailableAt = NOW + 5 * 60_000;
        api(data);
        renderAdmin('/website');

        const mobile = within(await screen.findByRole('region', { name: 'Home, mobile' }));
        expect(mobile.getByRole('button', { name: 'Run Home, mobile' })).toBeDisabled();
        expect(mobile.getByText(/Can run again/)).toBeInTheDocument();

        // "Run all" runs the rest.
        expect(screen.getByRole('button', { name: 'Run 1 now' })).toBeEnabled();
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
                        {
                            key: 'home-mobile',
                            page: 'Home',
                            path: '/',
                            strategy: 'mobile',
                            manualAvailableAt: null,
                            latest: null,
                            history: [],
                        },
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
        // Nothing run yet: the panel says so, and can be run now.
        expect(section('Lighthouse').getByText('Not run yet')).toBeInTheDocument();
        expect(
            section('Lighthouse').getByRole('button', { name: 'Run Home, mobile' }),
        ).toBeEnabled();
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

    it('describe timings against Lighthouse’s good thresholds', () => {
        expect(describeMetrics({ fcp: 1800, lcp: 2600, tbt: 200, cls: 0.11, si: 3400 })).toEqual([
            { label: 'FCP', name: 'First paint', value: '1.8 s', good: true },
            { label: 'LCP', name: 'Largest paint', value: '2.6 s', good: false },
            { label: 'TBT', name: 'Blocking time', value: '200 ms', good: true },
            { label: 'CLS', name: 'Layout shift', value: '0.11', good: false },
            { label: 'SI', name: 'Speed index', value: '3.4 s', good: true },
        ]);
        expect(describeMetrics({ fcp: null, lcp: null, tbt: 1180, cls: null, si: null })).toEqual([
            { label: 'TBT', name: 'Blocking time', value: '1,180 ms', good: false },
        ]);
        expect(describeMetrics(undefined)).toEqual([]);
    });

    it('add up the last days', () => {
        expect(lastDays([counts(1), counts(2, { bot: 1 }), counts(3)], 2)).toEqual(
            counts(5, { bot: 1 }),
        );
    });
});
