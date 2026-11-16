import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp.tsx';
import { routes } from '../routes.tsx';

/** Each page's path and the heading it opens with. */
const PAGES = [
    { path: '/', heading: 'Designing websites that convert' },
    { path: '/about', heading: 'About us' },
    { path: '/services', heading: 'Services' },
    { path: '/projects', heading: 'Our work' },
    { path: '/contact', heading: "Let's talk" },
];

describe('every page', () => {
    it('is listed here, so a new route gets these checks', () => {
        const paths = routes[0].children!.map((route) => (route.index ? '/' : `/${route.path}`));

        expect(paths.filter((path) => path !== '/*')).toEqual(PAGES.map((page) => page.path));
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

    it.each(PAGES)('$path has exactly one h1', ({ path }) => {
        renderApp(path);

        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it.each(PAGES)('$path: every in-page #link has somewhere to land', ({ path }) => {
        const { container } = renderApp(path);

        const missing = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
            .map((link) => link.getAttribute('href')!.slice(1))
            .filter((id) => !container.querySelector(`[id="${id}"]`));

        expect(missing).toEqual([]);
    });

    it.each(PAGES)('$path: every image has alt text', ({ path }) => {
        const { container } = renderApp(path);

        const unlabelled = [...container.querySelectorAll('img')].filter(
            (img) => !img.getAttribute('alt'),
        );

        expect(unlabelled).toEqual([]);
    });
});

describe('an address that is not a page', () => {
    it.each(['/nope', '/about/team', '/services/x'])(
        '%s shows Page not found, still with a way home',
        (path) => {
            renderApp(path);

            expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
            expect(screen.getByRole('link', { name: 'home page' })).toHaveAttribute('href', '/');
            expect(
                within(screen.getByRole('main')).getByRole('link', { name: 'Get in touch' }),
            ).toHaveAttribute('href', '/contact');
            expect(
                within(screen.getByRole('contentinfo')).getByRole('link', { name: 'About' }),
            ).toBeInTheDocument();
        },
    );
});
