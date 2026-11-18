import { render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axeViolations } from '../../test/axe.ts';
import {
    buildStatus,
    duration,
    latestBuilds,
    submissionStatus,
    version,
    type AppData,
    type Build,
} from '../app.ts';
import { clearCache } from '../cache.ts';
import { resetCollapsed } from '../collapsed.ts';
import { adminRoutes } from '../routes.tsx';
import { sectionLink } from './menu.ts';

afterEach(() => {
    clearCache();
    resetCollapsed();
});

const NOW = Date.UTC(2026, 10, 18, 14);
const PROJECT = 'https://expo.dev/accounts/liuqibasixseveneight/projects/ijji-tracker';

const build = (overrides: Partial<Build>): Build => ({
    id: 'b',
    status: 'FINISHED',
    platform: 'IOS',
    profile: 'production',
    distribution: 'STORE',
    appVersion: '1.0.3',
    buildNumber: '12',
    sdkVersion: '58.0.0',
    commit: 'abcdef1',
    commitMessage: 'feat: Achievements',
    createdAt: '2026-11-18T10:00:00.000Z',
    completedAt: '2026-11-18T10:14:00.000Z',
    simulator: false,
    error: null,
    url: `${PROJECT}/builds/b`,
    ...overrides,
});

const data = (overrides: Partial<AppData> = {}): AppData => ({
    now: NOW,
    projectUrl: PROJECT,
    builds: {
        data: [
            build({ id: 'b1', url: `${PROJECT}/builds/b1` }),
            build({
                id: 'b2',
                platform: 'ANDROID',
                status: 'ERRORED',
                buildNumber: '40',
                error: 'Gradle failed',
                url: `${PROJECT}/builds/b2`,
            }),
            build({ id: 'b3', profile: 'preview', platform: 'ANDROID', buildNumber: '39' }),
            build({ id: 'b4', platform: 'ANDROID', buildNumber: '38' }),
        ],
        error: null,
    },
    submissions: {
        data: [
            {
                id: 's1',
                status: 'FINISHED',
                platform: 'IOS',
                createdAt: '2026-11-18T11:00:00.000Z',
                completedAt: '2026-11-18T11:05:00.000Z',
                appVersion: '1.0.3',
                buildNumber: '12',
                error: null,
                url: `${PROJECT}/submissions/s1`,
            },
        ],
        error: null,
    },
    ...overrides,
});

const api = (body: AppData | null) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.endsWith('/me')) {
                return Response.json({ signedIn: true, expiresAt: NOW + 3600_000 });
            }
            if (url.endsWith('/app')) {
                return body ? Response.json(body) : Response.json({}, { status: 500 });
            }
            if (url.endsWith('/deletion-requests')) {
                return Response.json({ requests: [], now: NOW, sqlEditorUrl: 'x' });
            }
            return Response.json({}, { status: 500 });
        }),
    );

const renderAdmin = (path: string) =>
    render(<RouterProvider router={createMemoryRouter(adminRoutes, { initialEntries: [path] })} />);

const section = (name: string) => within(screen.getByRole('region', { name }));

describe('the IJJI Tracker page', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('is in the menu, and accessible', async () => {
        api(data());
        const { container } = renderAdmin('/ijji-tracker');
        await screen.findByRole('region', { name: 'Latest builds' });

        expect(document.title).toBe('IJJI Tracker · Admin · ijji labs');
        expect(await axeViolations(container)).toEqual([]);
        expect(await sectionLink('IJJI Tracker')).toHaveAttribute('aria-current', 'page');
    });

    it('shows the newest build of each profile on each platform', async () => {
        api(data());
        renderAdmin('/ijji-tracker');
        await screen.findByRole('region', { name: 'Latest builds' });

        const production = section('Production');
        const [ios, android] = production
            .getAllByRole('definition')
            .filter((dd) => dd.textContent?.includes('1.0.3'));
        expect(ios).toHaveTextContent('Built');
        expect(ios).toHaveTextContent('1.0.3 (12)');
        // The newest Android production build failed; an older one built.
        expect(android).toHaveTextContent('Failed');
        expect(android).toHaveTextContent('1.0.3 (40)');
        expect(section('Development').getAllByText('No builds yet')).toHaveLength(2);
        expect(
            section('Latest builds').getByRole('link', { name: /Open on Expo/ }),
        ).toHaveAttribute('href', PROJECT);
    });

    it('lists recent builds with their commit and any error, and store submissions', async () => {
        api(data());
        renderAdmin('/ijji-tracker');
        await screen.findByRole('region', { name: 'Recent builds' });

        const [first, second] = section('Recent builds').getAllByRole('listitem');
        expect(first).toHaveTextContent('1.0.3 (12)');
        expect(first).toHaveTextContent('14 min');
        expect(first).toHaveTextContent('abcdef1 feat: Achievements');
        expect(within(first).getByRole('link', { name: /Production · iOS/ })).toHaveAttribute(
            'href',
            `${PROJECT}/builds/b1`,
        );
        expect(second).toHaveTextContent('Gradle failed');

        const submission = section('Store submissions').getByRole('listitem');
        expect(submission).toHaveTextContent('Submitted');
        expect(
            within(submission).getByRole('link', { name: /App Store · 1.0.3 \(12\)/ }),
        ).toBeInTheDocument();
    });

    it('says when EXPO_TOKEN isn’t set', async () => {
        const missing = { data: null, error: 'EXPO_TOKEN isn’t set in Netlify yet.' };
        api(data({ builds: missing, submissions: missing }));
        renderAdmin('/ijji-tracker');
        await screen.findByRole('region', { name: 'Latest builds' });

        expect(
            section('Latest builds').getByText('EXPO_TOKEN isn’t set in Netlify yet.'),
        ).toBeInTheDocument();
    });

    it('sums up production on the Overview', async () => {
        api(data());
        renderAdmin('/');
        await screen.findByRole('heading', { name: 'IJJI Tracker' });
        const find = () => screen.getByRole('heading', { name: 'IJJI Tracker' }).closest('a')!;
        await waitFor(() => expect(find()).not.toHaveTextContent('Loading…'));

        const card = find();
        expect(card).toHaveAttribute('href', '/ijji-tracker');
        expect(card).toHaveTextContent('iOS production 1.0.3');
        expect(card).toHaveTextContent('Failed');
        expect(card).toHaveTextContent('Last submission, App Store');
    });
});

describe('the IJJI Tracker helpers', () => {
    it('word build and submission states', () => {
        expect(buildStatus('FINISHED')).toEqual({ label: 'Built', level: 'good' });
        expect(buildStatus('ERRORED').level).toBe('critical');
        expect(buildStatus('IN_QUEUE')).toEqual({ label: 'Queued', level: 'warning' });
        expect(submissionStatus('AWAITING_BUILD').label).toBe('Waiting for build');
    });

    it('find the newest of each, and say versions and durations', () => {
        const latest = latestBuilds([
            build({ id: 'new', platform: 'ANDROID' }),
            build({ id: 'old', platform: 'ANDROID' }),
        ]);
        expect(latest('production', 'ANDROID')?.id).toBe('new');
        expect(latest('production', 'IOS')).toBeNull();
        expect(version('1.0.3', '12')).toBe('1.0.3 (12)');
        expect(version(null, null)).toBeNull();
        expect(duration(build({}))).toBe('14 min');
        expect(duration(build({ completedAt: null }))).toBeNull();
    });
});
