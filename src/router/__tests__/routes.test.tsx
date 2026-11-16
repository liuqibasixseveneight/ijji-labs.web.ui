import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apps } from '../../content';
import { axeViolations } from '../../test/axe.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { paths } from '../paths.ts';
import { routes } from '../routes.tsx';

const tracker = paths.app('ijji-tracker');

/** Every page: its path, the heading it opens with, and the start of its <title>. */
const PAGES = [
    { path: paths.home, heading: 'Designing websites that work', title: 'ijji labs' },
    { path: paths.about, heading: 'About us', title: 'About' },
    { path: paths.services, heading: 'Services', title: 'Services' },
    { path: paths.projects, heading: 'Our work', title: 'Our work' },
    { path: paths.apps, heading: 'Apps', title: 'Apps' },
    { path: tracker.root, heading: 'IJJI Tracker', title: 'IJJI Tracker' },
    { path: tracker.privacy, heading: 'IJJI Tracker privacy policy', title: 'Privacy policy' },
    { path: tracker.terms, heading: 'IJJI Tracker terms of use', title: 'Terms of use' },
    { path: tracker.support, heading: 'IJJI Tracker support', title: 'Support' },
    {
        path: tracker.deleteAccount,
        heading: 'Delete your IJJI Tracker account',
        title: 'Delete your account',
    },
    { path: paths.contact, heading: 'Let’s talk', title: 'Contact' },
    { path: paths.privacy, heading: 'Website privacy policy', title: 'Website privacy policy' },
];

/** The route table's paths, with each app's slug filled in. */
const routePaths = () =>
    routes[0]
        .children!.filter((route) => route.path !== '*')
        .flatMap((route) => {
            const path = route.index ? '/' : `/${route.path}`;
            return path.includes(':appSlug')
                ? apps.map((app) => path.replace(':appSlug', app.slug))
                : [path];
        });

describe('every page', () => {
    it('is listed here, so a new route gets these checks', () => {
        expect(routePaths().sort()).toEqual(PAGES.map((page) => page.path).sort());
    });

    it.each(PAGES)(
        '$path opens with its heading, the navbar and the footer',
        ({ path, heading }) => {
            renderApp(path);

            expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        },
    );

    it.each(PAGES)(
        '$path has a title, a description and its own canonical address',
        ({ path, title }) => {
            renderApp(path);

            expect(document.title.startsWith(title)).toBe(true);
            expect(document.title).toContain('ijji labs');
            expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
                'content',
                expect.stringMatching(/.{40,}/),
            );
            expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
                'href',
                `https://www.ijji-labs.com${path === '/' ? '' : path}`,
            );
        },
    );

    it.each(PAGES)('$path has exactly one h1, and no skipped heading levels', ({ path }) => {
        const { container } = renderApp(path);

        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

        const headings = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')];
        const skips = headings
            .map((h, i) => ({ text: h.textContent, level: Number(h.tagName[1]), i }))
            .filter(({ level, i }) => i > 0 && level > Number(headings[i - 1].tagName[1]) + 1)
            .map(({ text, level }) => `h${level} ${text}`);

        expect(skips).toEqual([]);
    });

    it.each(PAGES)('$path: every in-page #link has somewhere to land', ({ path }) => {
        const { container } = renderApp(path);

        const missing = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
            .map((link) => link.getAttribute('href')!.slice(1))
            .filter((id) => !container.querySelector(`[id="${id}"]`));

        expect(missing).toEqual([]);
    });

    it.each(PAGES)('$path: every id is unique', ({ path }) => {
        const { container } = renderApp(path);

        const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    });

    it.each(PAGES)('$path: every in-site link goes to a real page', ({ path }) => {
        const { container } = renderApp(path);
        const known = new Set(routePaths());

        const broken = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')]
            .map((link) => link.getAttribute('href')!.split(/[?#]/)[0])
            .filter((href) => !known.has(href));

        expect(broken).toEqual([]);
    });

    it.each(PAGES)('$path: every image has alt text, or alt="" if decorative', ({ path }) => {
        const { container } = renderApp(path);

        // A missing alt is a mistake; alt="" is a choice (an app icon beside the app's name).
        expect(
            [...container.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')),
        ).toEqual([]);
    });

    it.each(PAGES)('$path passes axe’s accessibility checks', async ({ path }) => {
        const { container } = renderApp(path);

        expect(await axeViolations(container)).toEqual([]);
    });
});

describe('an address that is not a page', () => {
    it.each(['/nope', '/about/team', '/apps/not-an-app', '/apps/not-an-app/privacy'])(
        '%s shows Page not found, still with a way home',
        async (path) => {
            renderApp(path);

            expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
            expect(screen.getByRole('link', { name: 'home page' })).toHaveAttribute('href', '/');
            expect(
                within(screen.getByRole('main')).getByRole('link', { name: 'Get in touch' }),
            ).toHaveAttribute('href', '/contact');
            await waitFor(() =>
                expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
                    'content',
                    'noindex',
                ),
            );
        },
    );
});
