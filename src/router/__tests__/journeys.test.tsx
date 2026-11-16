import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderApp } from '../../test/renderApp.tsx';

/**
 * Every way of moving between pages, against the real routes. Mirrors the
 * exits in docs/screen-map/screens.js: when a page gains or loses a link,
 * change both.
 */

const h1 = () => screen.getByRole('heading', { level: 1 });
const main = () => within(screen.getByRole('main'));
const footer = () => within(screen.getByRole('contentinfo'));
const menuButton = () => screen.getByRole('button', { name: /menu/i });

const MENU = [
    { label: 'Home', path: '/', heading: 'Designing websites that convert' },
    { label: 'About', path: '/about', heading: 'About us' },
    { label: 'Services', path: '/services', heading: 'Services' },
    { label: 'Projects', path: '/projects', heading: 'Our work' },
    { label: 'Contact', path: '/contact', heading: "Let's talk" },
];

describe('the menu', () => {
    it('is closed, and out of reach, until the hamburger is pressed', async () => {
        const { user } = renderApp('/about');

        expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();

        await user.click(menuButton());

        expect(menuButton()).toHaveAccessibleName('Close menu');
        expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('navigation', { name: 'Main' })).toBeVisible();
        expect(document.documentElement).toHaveClass('overflow-hidden');
    });

    it('closes again from the same button, and lets the page scroll', async () => {
        const { user } = renderApp('/about');

        await user.click(menuButton());
        await user.click(menuButton());

        expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(document.documentElement).not.toHaveClass('overflow-hidden');
    });

    it.each(MENU)('$label opens $path and closes the menu', async ({ label, path, heading }) => {
        // Start somewhere else, so every item is a real move.
        const { user, router } = renderApp(path === '/contact' ? '/about' : '/contact');

        await user.click(menuButton());
        const menu = within(screen.getByRole('navigation', { name: 'Main' }));
        await user.click(menu.getByRole('link', { name: new RegExp(label) }));

        expect(router.state.location.pathname).toBe(path);
        expect(h1()).toHaveAccessibleName(heading);
        expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});

describe('the navbar', () => {
    it('logo goes home from any page', async () => {
        const { user, router } = renderApp('/services');

        await user.click(
            within(screen.getAllByRole('navigation')[0]).getByRole('link', {
                name: 'ijji labs home',
            }),
        );

        expect(router.state.location.pathname).toBe('/');
    });

    it('Get in touch opens Contact', async () => {
        const { user, router } = renderApp('/');

        await user.click(
            within(screen.getAllByRole('navigation')[0]).getByRole('link', {
                name: 'Get in touch',
            }),
        );

        expect(router.state.location.pathname).toBe('/contact');
        expect(h1()).toHaveAccessibleName("Let's talk");
    });
});

describe('the footer', () => {
    it.each(MENU.filter((item) => item.path !== '/'))(
        '$label opens $path and marks itself as the current page',
        async ({ label, path, heading }) => {
            const { user, router } = renderApp('/');

            await user.click(footer().getByRole('link', { name: label }));

            expect(router.state.location.pathname).toBe(path);
            expect(h1()).toHaveAccessibleName(heading);
            expect(footer().getByRole('link', { name: label })).toHaveAttribute(
                'aria-current',
                'page',
            );
        },
    );

    it('logo goes home', async () => {
        const { user, router } = renderApp('/about');

        await user.click(footer().getByRole('link', { name: 'ijji labs home' }));

        expect(router.state.location.pathname).toBe('/');
    });
});

describe('calls to action in the page', () => {
    it.each([
        { from: '/services', name: 'just ask', why: 'FAQ intro' },
        { from: '/services', name: 'Get in touch', why: 'Ready to start?' },
        { from: '/projects', name: 'Get in touch', why: 'Got a project in mind?' },
        { from: '/not-a-page', name: 'Get in touch', why: 'Page not found' },
    ])('$from: $name ($why) opens Contact', async ({ from, name }) => {
        const { user, router } = renderApp(from);

        await user.click(main().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe('/contact');
    });

    it('Page not found: home page goes home', async () => {
        const { user, router } = renderApp('/not-a-page');

        await user.click(main().getByRole('link', { name: 'home page' }));

        expect(router.state.location.pathname).toBe('/');
    });
});

describe('jump links stay on the page', () => {
    it.each([
        {
            path: '/about',
            links: ['Our story', 'Why independent?', 'Your ownership', 'What we stand for'],
        },
        {
            path: '/services',
            links: ['Design & Development', 'Handover & Training', 'Post-Launch Support', 'FAQ'],
        },
        { path: '/projects', links: ['CluedIn', 'Dedalus', 'DXC Technology', 'Our approach'] },
    ])('$path', ({ path, links }) => {
        renderApp(path);

        for (const name of links) {
            const href = main().getByRole('link', { name }).getAttribute('href')!;

            expect(href).toMatch(/^#/);
            expect(document.getElementById(href.slice(1))).toBeInTheDocument();
        }
    });
});

describe('a link to a section of another page', () => {
    it('opens the page at that section, not the top', () => {
        renderApp('/projects#project-dedalus');

        const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);

        expect(scrollIntoView).toHaveBeenCalledOnce();
        expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('project-dedalus'));
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('opens at the top when the section is not there', () => {
        renderApp('/projects#gone');

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});

describe('the home hero palette', () => {
    it('a dark palette turns the navbar and hero text white; leaving Home resets it', async () => {
        const { user } = renderApp('/');
        const logo = () =>
            within(screen.getAllByRole('navigation')[0]).getByRole('link', {
                name: 'ijji labs home',
            });

        expect(logo()).not.toHaveClass('text-white');

        await user.click(screen.getByRole('button', { name: 'Dusk' }));

        expect(screen.getByRole('button', { name: 'Dusk' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        expect(logo()).toHaveClass('text-white');
        expect(h1()).toHaveClass('text-white');

        await user.click(footer().getByRole('link', { name: 'About' }));
        await user.click(footer().getByRole('link', { name: 'ijji labs home' }));

        expect(logo()).not.toHaveClass('text-white');
    });
});
