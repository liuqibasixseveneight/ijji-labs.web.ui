import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import { adminRoutes } from '../routes.tsx';
import {
    environmentFrom,
    formatBytes,
    lastDaysOf,
    migrationDate,
    projectState,
    seriesDays,
    type Supabase,
} from '../supabase.ts';

const NOW = Date.UTC(2026, 10, 18, 14);
const REF = 'abcdefghijklmnopqrst';
const days = (fill: (i: number) => number) => Array.from({ length: 90 }, (_, i) => fill(i));

const supabase = (overrides: Partial<Supabase> = {}): Supabase => ({
    env: 'prod',
    now: NOW,
    ref: REF,
    project: {
        data: {
            name: 'ijji-tracker',
            region: 'eu-west-1',
            status: 'ACTIVE_HEALTHY',
            paused: false,
        },
        error: null,
    },
    health: {
        data: [
            { name: 'db', status: 'ACTIVE_HEALTHY', healthy: true },
            { name: 'auth', status: 'UNHEALTHY', healthy: false },
        ],
        error: null,
    },
    usage: {
        data: {
            from: '2026-08-21',
            users: 1234,
            confirmed: 1000,
            signupsByDay: days((i) => (i >= 83 ? 2 : i >= 60 ? 1 : 0)),
            sessionsByDay: days((i) => (i >= 60 ? 4 : 0)),
            minutesByDay: days((i) => (i >= 60 ? 90 : 0)),
            sessions: 5120,
            recorders: { day: 3, week: 9, month: 20 },
        },
        error: null,
    },
    database: {
        data: {
            bytes: 12_582_912,
            limitBytes: 500 * 1024 * 1024,
            tables: [
                { name: 'sessions', rows: 5120, bytes: 983_040 },
                { name: 'profiles', rows: 1234, bytes: 163_840 },
            ],
            migrations: { count: 21, latest: '20261118120000' },
        },
        error: null,
    },
    security: {
        data: [
            {
                name: 'rls_disabled_in_public',
                title: 'RLS Disabled in Public',
                level: 'ERROR',
                detail: 'Table public.x has RLS off',
                remediation: 'https://supabase.com/docs/guides/database/linter',
            },
        ],
        error: null,
    },
    performance: { data: [], error: null },
    traffic: {
        data: {
            hours: [
                { at: NOW - 3600_000, requests: 120, clientErrors: 4, serverErrors: 1 },
                { at: NOW, requests: 80, clientErrors: 0, serverErrors: 0 },
            ],
            topErrors: [
                { status: 503, method: 'POST', path: '/rest/v1/rpc/delete_account', count: 1 },
            ],
        },
        error: null,
    },
    ...overrides,
});

const api = (data: (env: string) => Supabase | null) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me'))
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            if (url.includes('/supabase')) {
                const env = new URL(url, 'https://x').searchParams.get('env') ?? 'prod';
                const body = data(env);
                return body ? Response.json(body) : Response.json({}, { status: 500 });
            }
            if (url.endsWith('/website')) return Response.json({}, { status: 500 });
            return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
        }),
    );

const renderAdmin = (path: string) =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

const section = (name: string) => within(screen.getByRole('region', { name }));

describe('the Supabase page', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('is in the nav, and accessible', async () => {
        api(() => supabase());
        const { container } = renderAdmin('/supabase');

        expect(
            await screen.findByRole('heading', { level: 1, name: 'Supabase' }),
        ).toBeInTheDocument();
        expect(document.title).toBe('Supabase · Admin · ijji labs');
        expect(
            within(screen.getByRole('navigation', { name: 'Admin' })).getByRole('link', {
                name: 'Supabase',
            }),
        ).toHaveAttribute('aria-current', 'page');
        expect(await axeViolations(container)).toEqual([]);
    });

    it('shows the project, its services, and a link to it in Supabase', async () => {
        api(() => supabase());
        renderAdmin('/supabase');
        const project = within(await screen.findByRole('region', { name: 'Production' }));

        expect(project.getByText('Active')).toBeInTheDocument();
        expect(project.getByText('eu-west-1')).toBeInTheDocument();
        const services = within(project.getByRole('list', { name: 'Services' }));
        expect(services.getByText('Database')).toBeInTheDocument();
        expect(services.getByText('Auth: down')).toBeInTheDocument();
        expect(project.getByRole('link', { name: /Open in Supabase/ })).toHaveAttribute(
            'href',
            `https://supabase.com/dashboard/project/${REF}`,
        );
    });

    it('counts people and sessions, with a table behind each chart', async () => {
        api(() => supabase());
        renderAdmin('/supabase');
        await screen.findByRole('heading', { name: 'People' });

        const people = section('People');
        expect(people.getByText('Accounts').nextElementSibling).toHaveTextContent('1,234');
        expect(people.getByText('81% of accounts')).toBeInTheDocument();
        expect(people.getByText('Last 7 days').previousElementSibling).toHaveTextContent('14');
        expect(people.getByRole('table', { name: 'Sign-ups per day' })).toBeInTheDocument();

        const sessions = section('Sessions');
        expect(sessions.getByText('Active, 7 days').nextElementSibling).toHaveTextContent('9');
        // 30 days of 90 minutes: 45 hours, from 120 sessions.
        expect(sessions.getByText('Focus time').nextElementSibling).toHaveTextContent('45 h');
        expect(sessions.getByText('120 sessions in 30 days')).toBeInTheDocument();
        expect(sessions.getByText('5,120 sessions recorded in all.')).toBeInTheDocument();
    });

    it('shows the database against the free plan, its tables and migrations', async () => {
        api(() => supabase());
        renderAdmin('/supabase');
        await screen.findByRole('heading', { name: 'Database' });

        const db = section('Database');
        expect(db.getByText('12.0 MB')).toBeInTheDocument();
        expect(db.getByText('of 500 MB')).toBeInTheDocument();
        expect(db.getByRole('meter')).toHaveAttribute('aria-valuetext', '2% used');
        expect(db.getByText('21 migrations, latest 18 Nov 2026')).toBeInTheDocument();
        expect(db.getByText('sessions').closest('li')).toHaveTextContent(
            'about 5,120 rows · 960 kB',
        );
    });

    it('lists what the advisors flag, with how to fix it, and says when there’s nothing', async () => {
        api(() => supabase());
        renderAdmin('/supabase');
        await screen.findByRole('heading', { name: 'Security Advisor' });

        const security = section('Security Advisor');
        expect(
            security.getByText('RLS Disabled in Public').previousElementSibling,
        ).toHaveTextContent('Error');
        expect(
            security.getByRole('link', { name: /How to fix it: RLS Disabled in Public/ }),
        ).toHaveAttribute('href', 'https://supabase.com/docs/guides/database/linter');
        expect(section('Performance Advisor').getByText('No findings')).toBeInTheDocument();
    });

    it('shows the last day’s API traffic and its commonest errors', async () => {
        api(() => supabase());
        renderAdmin('/supabase');
        await screen.findByRole('heading', { name: 'API traffic' });

        const traffic = section('API traffic');
        expect(
            traffic.getByText('Requests', { selector: 'dt' }).nextElementSibling,
        ).toHaveTextContent('200');
        expect(traffic.getByText('Server errors').nextElementSibling).toHaveTextContent('1');
        expect(traffic.getByRole('table', { name: 'API requests per hour' })).toBeInTheDocument();
        expect(
            traffic.getByText(/POST \/rest\/v1\/rpc\/delete_account/).closest('li'),
        ).toHaveTextContent('1 time');
    });

    it('switches to the develop project', async () => {
        const user = userEvent.setup();
        api((env) => supabase({ env: env as Supabase['env'] }));
        renderAdmin('/supabase');
        const tabs = within(await screen.findByRole('navigation', { name: 'Project' }));
        expect(tabs.getByRole('link', { name: 'Production' })).toHaveAttribute(
            'aria-current',
            'page',
        );

        await user.click(tabs.getByRole('link', { name: 'Develop' }));

        expect(await screen.findByRole('region', { name: 'Develop' })).toBeInTheDocument();
        expect(tabs.getByRole('link', { name: 'Develop' })).toHaveAttribute('aria-current', 'page');
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
            '/api/admin/supabase?env=dev',
            expect.anything(),
        );
    });

    it('says what isn’t set up, and when the project is paused', async () => {
        api(() =>
            supabase({
                project: {
                    data: {
                        name: 'ijji-tracker-dev',
                        region: 'eu-west-1',
                        status: 'INACTIVE',
                        paused: true,
                    },
                    error: null,
                },
                health: { data: null, error: 'The project is paused.' },
                usage: { data: null, error: 'The project is paused.' },
                traffic: {
                    data: null,
                    error: 'SUPABASE_PROD_ACCESS_TOKEN isn’t set in Netlify yet.',
                },
            }),
        );
        renderAdmin('/supabase');
        const project = within(await screen.findByRole('region', { name: 'Production' }));

        expect(project.getByText('Paused')).toBeInTheDocument();
        expect(project.getByText(/Free projects pause after a week/)).toBeInTheDocument();
        expect(section('People').getByText('The project is paused.')).toBeInTheDocument();
        expect(
            section('API traffic').getByText(
                'SUPABASE_PROD_ACCESS_TOKEN isn’t set in Netlify yet.',
            ),
        ).toBeInTheDocument();
    });

    it('says when nothing could be loaded', async () => {
        api(() => null);
        renderAdmin('/supabase');
        expect(
            await screen.findByText('Couldn’t load Supabase’s data. Reload to try again.'),
        ).toBeInTheDocument();
    });

    it('sums up production on the Overview', async () => {
        api(() => supabase());
        renderAdmin('/');
        const card = (await screen.findByRole('heading', { name: 'Supabase' })).closest('a')!;

        expect(card).toHaveAttribute('href', '/supabase');
        expect(card).toHaveTextContent('Active');
        expect(card).toHaveTextContent('1,234 accounts, 14 new this week');
        expect(card).toHaveTextContent('1 to look at');
    });
});

describe('the Supabase helpers', () => {
    it('read the environment from the address', () => {
        expect(environmentFrom('?env=dev')).toBe('dev');
        expect(environmentFrom('')).toBe('prod');
        expect(environmentFrom('?env=anything')).toBe('prod');
    });

    it('word a project’s state', () => {
        expect(projectState('ACTIVE_HEALTHY')).toEqual({ label: 'Active', level: 'good' });
        expect(projectState('INACTIVE')).toEqual({ label: 'Paused', level: 'critical' });
        expect(projectState('RESTORING')).toEqual({ label: 'Starting', level: 'warning' });
        expect(projectState('INIT_FAILED')).toEqual({ label: 'Init failed', level: 'critical' });
    });

    it('format sizes and migration dates', () => {
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(163_840)).toBe('160 kB');
        expect(formatBytes(12_582_912)).toBe('12.0 MB');
        expect(formatBytes(500 * 1024 * 1024)).toBe('500 MB');
        expect(migrationDate('20261118120000')).toBe('18 Nov 2026');
        expect(migrationDate('init')).toBe('init');
    });

    it('add up and date a daily series', () => {
        expect(lastDaysOf([1, 2, 3, 4], 2)).toBe(7);
        expect(seriesDays('2026-08-21', 3)).toEqual(['2026-08-21', '2026-08-22', '2026-08-23']);
    });
});
