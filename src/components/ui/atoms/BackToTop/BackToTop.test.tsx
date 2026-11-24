import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackToTop } from './BackToTop.tsx';

const scrollTo = (y: number) =>
    act(() => {
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
        window.dispatchEvent(new Event('scroll'));
    });

describe('BackToTop', () => {
    const windowScrollTo = vi.fn();

    beforeEach(() => {
        window.scrollTo = windowScrollTo as unknown as typeof window.scrollTo;
        window.matchMedia = vi.fn().mockReturnValue({ matches: false });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 10000,
            configurable: true,
        });
    });

    afterEach(() => windowScrollTo.mockReset());

    it('stays out of reach near the top of the page', () => {
        render(<BackToTop />);

        // Inert: hidden from screen readers and skipped by Tab (jsdom doesn't apply it itself).
        expect(screen.getByRole('button', { name: 'Back to top' })).toHaveAttribute('inert');
    });

    it('stays once the first screen has scrolled away, on a wider screen', () => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: true });
        render(<BackToTop />);

        scrollTo(1200);
        scrollTo(1400);

        expect(screen.getByRole('button', { name: 'Back to top' })).not.toHaveAttribute('inert');
    });

    it('on a phone, steps aside while scrolling down, and comes back on the way up', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: 'Back to top' });

        scrollTo(1200);
        expect(button).toHaveAttribute('inert');

        scrollTo(1100);
        expect(button).not.toHaveAttribute('inert');

        scrollTo(1400);
        expect(button).toHaveAttribute('inert');
    });

    it('shows at the end of the page', () => {
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 2000,
            configurable: true,
        });
        render(<BackToTop />);

        scrollTo(1200);

        expect(screen.getByRole('button', { name: 'Back to top' })).not.toHaveAttribute('inert');
    });

    it('glides to the top and moves focus there', () => {
        render(
            <>
                <main id='main' tabIndex={-1} />
                <BackToTop />
            </>,
        );
        scrollTo(1300);
        scrollTo(1200);

        fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));

        expect(windowScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        expect(document.getElementById('main')).toHaveFocus();
    });

    it('jumps instead for people who ask for less motion', () => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: true });
        render(<BackToTop />);
        scrollTo(1300);
        scrollTo(1200);

        fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));

        expect(windowScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    });
});
