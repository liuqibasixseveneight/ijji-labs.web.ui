import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderApp } from '../../test/renderApp.tsx';
import { paths } from '../paths.ts';

/**
 * Every way of moving between pages, against the real routes. Mirrors the
 * exits in docs/screen-map/screens.js: when a page gains or loses a link,
 * change both.
 */

const tracker = paths.app('ijji-tracker');

const h1 = () => screen.getByRole('heading', { level: 1 });
const main = () => within(screen.getByRole('main'));
const navbar = () => within(screen.getByRole('navigation', { name: 'Site' }));
const footer = () => within(screen.getByRole('contentinfo'));
const legal = () => within(screen.getByRole('navigation', { name: 'Legal' }));
const menuButton = () => screen.getByRole('button', { name: /menu/i });

const MENU = [
    { label: 'Home', path: '/', heading: 'Designing websites that work' },
    { label: 'About', path: '/about', heading: 'About us' },
    { label: 'Services', path: '/services', heading: 'Services' },
    { label: 'Projects', path: '/projects', heading: 'Our work' },
    { label: 'Apps', path: '/apps', heading: 'Apps' },
    { label: 'Contact', path: '/contact', heading: 'Let’s talk' },
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

    it('moves focus to its first link when it opens', async () => {
        const { user } = renderApp('/about');

        await user.click(menuButton());

        expect(
            within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')[0],
        ).toHaveFocus();
    });

    it('closes with Esc, and puts focus back on the hamburger', async () => {
        const { user } = renderApp('/about');

        await user.click(menuButton());
        await user.keyboard('{Escape}');

        expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(menuButton()).toHaveFocus();
        expect(document.documentElement).not.toHaveClass('overflow-hidden');
    });

    it('closes again from the same button', async () => {
        const { user } = renderApp('/about');

        await user.click(menuButton());
        await user.click(menuButton());

        expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
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

        await user.click(navbar().getByRole('link', { name: 'ijji labs home' }));

        expect(router.state.location.pathname).toBe('/');
    });

    it('Get in touch opens Contact, on every screen size', async () => {
        const { user, router } = renderApp('/');

        await user.click(navbar().getByRole('link', { name: 'Get in touch' }));

        expect(router.state.location.pathname).toBe('/contact');
        expect(h1()).toHaveAccessibleName('Let’s talk');
    });
});

describe('the footer', () => {
    it.each(MENU.filter((item) => item.path !== '/'))(
        '$label opens $path and marks itself as the current page',
        async ({ label, path, heading }) => {
            const { user, router } = renderApp('/');

            await user.click(
                within(screen.getByRole('navigation', { name: 'Footer' })).getByRole('link', {
                    name: label,
                }),
            );

            expect(router.state.location.pathname).toBe(path);
            expect(h1()).toHaveAccessibleName(heading);
        },
    );

    it.each([
        { name: 'ijji labs: Privacy', path: paths.privacy },
        { name: 'IJJI Tracker: Privacy', path: tracker.privacy },
        { name: 'IJJI Tracker: Terms', path: tracker.terms },
        { name: 'IJJI Tracker: Support', path: tracker.support },
        { name: 'IJJI Tracker: Delete account', path: tracker.deleteAccount },
    ])('legal link $name opens $path from any page', async ({ name, path }) => {
        const { user, router } = renderApp('/services');

        await user.click(legal().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe(path);
    });

    it('logo goes home', async () => {
        const { user, router } = renderApp('/about');

        await user.click(footer().getByRole('link', { name: 'ijji labs home' }));

        expect(router.state.location.pathname).toBe('/');
    });
});

describe('finding IJJI Tracker', () => {
    it('Home → See IJJI Tracker → its privacy policy, and back via the breadcrumb', async () => {
        const { user, router } = renderApp('/');

        await user.click(main().getByRole('link', { name: 'See IJJI Tracker' }));
        expect(router.state.location.pathname).toBe(tracker.root);
        expect(main().getAllByText('Coming soon')).toHaveLength(2);

        await user.click(main().getByRole('link', { name: /^Privacy policy/ }));
        expect(router.state.location.pathname).toBe(tracker.privacy);

        const breadcrumb = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));
        await user.click(breadcrumb.getByRole('link', { name: 'IJJI Tracker' }));
        expect(router.state.location.pathname).toBe(tracker.root);
    });

    it('a policy’s breadcrumb leads back to Apps', async () => {
        const { user, router } = renderApp(tracker.terms);

        const breadcrumb = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));
        await user.click(breadcrumb.getByRole('link', { name: 'Apps' }));

        expect(router.state.location.pathname).toBe(paths.apps);
    });

    it.each([
        { name: /^Privacy policy/, path: tracker.privacy },
        { name: /^Terms of use/, path: tracker.terms },
        { name: /^Support/, path: tracker.support },
        { name: /^Delete your account/, path: tracker.deleteAccount },
    ])('the app page links to $path', async ({ name, path }) => {
        const { user, router } = renderApp(tracker.root);

        await user.click(main().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe(path);
    });

    it('Home and /apps link to the app; About links to /apps', async () => {
        const { user, router } = renderApp('/');
        await user.click(main().getByRole('link', { name: 'See our apps' }));
        expect(router.state.location.pathname).toBe(paths.apps);

        await user.click(main().getByRole('link', { name: 'See IJJI Tracker' }));
        expect(router.state.location.pathname).toBe(tracker.root);

        await user.click(navbar().getByRole('link', { name: 'ijji labs home' }));
        await user.click(footer().getByRole('link', { name: 'About' }));
        await user.click(main().getByRole('link', { name: 'See our apps' }));
        expect(router.state.location.pathname).toBe(paths.apps);
    });

    it('Support → send us a message opens Contact on IJJI Tracker help', async () => {
        const { user, router } = renderApp(tracker.support);

        await user.click(main().getByRole('link', { name: 'send us a message' }));

        expect(router.state.location.pathname).toBe('/contact');
        expect(router.state.location.search).toBe('?topic=support');
        expect(await screen.findByDisplayValue('Help with IJJI Tracker')).toBeInTheDocument();
    });
});

describe('onward links on Home (no dead ends)', () => {
    it.each([
        { name: 'More about us', path: paths.about },
        { name: 'All services', path: paths.services },
        { name: 'See our apps', path: paths.apps },
        { name: 'All projects', path: paths.projects },
    ])('$name opens $path', async ({ name, path }) => {
        const { user, router } = renderApp('/');

        await user.click(main().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe(path);
    });
});

describe('calls to action in the page', () => {
    it.each([
        {
            from: '/about',
            name: 'Get in touch',
            topic: '?topic=website',
            why: 'Got something in mind?',
        },
        { from: '/services', name: 'just ask', topic: '', why: 'FAQ intro' },
        {
            from: '/services',
            name: 'Get in touch',
            topic: '?topic=website',
            why: 'Ready to start?',
        },
        { from: '/projects', name: 'Get in touch', topic: '', why: 'Got a project in mind?' },
        {
            from: '/apps',
            name: 'Ask for help',
            topic: '?topic=support',
            why: 'Need help with IJJI Tracker?',
        },
        { from: '/not-a-page', name: 'Get in touch', topic: '', why: 'Page not found' },
    ])('$from: $name ($why) opens Contact', async ({ from, name, topic }) => {
        const { user, router } = renderApp(from);

        await user.click(main().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe('/contact');
        expect(router.state.location.search).toBe(topic);
    });

    it('the app page: Get support opens its support page', async () => {
        const { user, router } = renderApp(tracker.root);

        await user.click(main().getByRole('link', { name: 'Get support' }));

        expect(router.state.location.pathname).toBe(tracker.support);
    });

    it('Page not found: home page goes home', async () => {
        const { user, router } = renderApp('/not-a-page');

        await user.click(main().getByRole('link', { name: 'home page' }));

        expect(router.state.location.pathname).toBe('/');
    });

    it.each([
        { name: /^Services/, to: '/services' },
        { name: /^Our work/, to: '/projects' },
        { name: /^Apps/, to: '/apps' },
        { name: /^About us/, to: '/about' },
    ])('Page not found: the $to card goes there', async ({ name, to }) => {
        const { user, router } = renderApp('/not-a-page');

        await user.click(main().getByRole('link', { name }));

        expect(router.state.location.pathname).toBe(to);
    });
});

describe('jump links stay on the page', () => {
    it.each([
        {
            path: '/about',
            links: [
                'Our story',
                'Why independent?',
                'Your ownership',
                'Our own apps',
                'What we stand for',
            ],
        },
        {
            path: '/services',
            links: ['Websites', 'Handover & Training', 'Post-Launch Support', 'FAQ'],
        },
        { path: '/projects', links: ['CluedIn', 'Dedalus', 'DXC Technology', 'Our process'] },
        { path: tracker.root, links: ['What it does', 'Privacy and support'] },
    ])('$path', ({ path, links }) => {
        renderApp(path);
        const onThisPage = within(screen.getByRole('navigation', { name: 'On this page' }));

        for (const name of links) {
            const href = onThisPage.getByRole('link', { name }).getAttribute('href')!;

            expect(href).toMatch(/^#/);
            expect(document.getElementById(href.slice(1))).toBeInTheDocument();
        }
    });

    it('a policy’s contents list links to each of its sections', () => {
        renderApp(tracker.privacy);
        const contents = within(screen.getByRole('navigation', { name: 'On this page' }));

        const links = contents.getAllByRole('link');
        expect(links.length).toBeGreaterThan(5);
        for (const link of links) {
            const section = document.getElementById(link.getAttribute('href')!.slice(1))!;
            expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
                link.textContent!,
            );
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
        const logo = () => navbar().getByRole('link', { name: 'ijji labs home' });

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
