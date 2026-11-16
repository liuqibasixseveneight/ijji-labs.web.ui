import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { renderApp } from '../../../../test/renderApp.tsx';

const scrollTo = (y: number) =>
    act(() => {
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
        window.dispatchEvent(new Event('scroll'));
    });

const navbar = () => screen.getByRole('navigation', { name: 'Site' });
/** How much of the dark background shows: 0 see-through, 1 fully dark. */
const fill = () => Number(screen.getByTestId('navbar-fill').style.opacity || 0);

describe('the navbar', () => {
    afterEach(() => scrollTo(0));

    it.each(['/about', '/services', '/apps', '/apps/ijji-tracker/privacy', '/contact'])(
        '%s: see-through at the top, easing to dark over the first 160px of scroll, and back',
        (path) => {
            renderApp(path);
            expect(fill()).toBe(0);

            // Eased: slow to start, halfway at the midpoint.
            scrollTo(40);
            expect(fill()).toBeGreaterThan(0);
            expect(fill()).toBeLessThan(0.25);

            scrollTo(80);
            expect(fill()).toBe(0.5);

            scrollTo(240);
            expect(fill()).toBe(1);

            scrollTo(0);
            expect(fill()).toBe(0);
        },
    );

    it('on Home, stays see-through over the gradient hero, fading in as it goes by', () => {
        renderApp('/');

        scrollTo(10);
        expect(fill()).toBe(0);

        scrollTo(window.innerHeight);
        expect(fill()).toBe(1);
    });

    it('keeps the logo white on pages that start dark, even at the top', () => {
        renderApp('/about');

        expect(within(navbar()).getByRole('link', { name: 'ijji labs home' }).className).toContain(
            'text-white',
        );
    });
});
