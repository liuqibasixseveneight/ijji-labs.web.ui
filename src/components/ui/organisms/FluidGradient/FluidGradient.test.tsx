import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FluidGradient } from './FluidGradient.tsx';

const setReducedMotion = (reduce: boolean) => {
    window.matchMedia = vi
        .fn()
        .mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia;
};

describe('FluidGradient', () => {
    afterEach(() => {
        // @ts-expect-error jsdom has no matchMedia; put it back the way it was.
        delete window.matchMedia;
    });

    it('waits for the hero to be on screen before starting WebGL', () => {
        setReducedMotion(false);
        const observe = vi.spyOn(window.IntersectionObserver.prototype, 'observe');

        render(<FluidGradient />);

        expect(observe).toHaveBeenCalledOnce();
    });

    it('never starts WebGL for people who ask for less motion: the still gradient stays', () => {
        setReducedMotion(true);
        const observe = vi.spyOn(window.IntersectionObserver.prototype, 'observe');

        const { container } = render(<FluidGradient />);

        expect(observe).not.toHaveBeenCalled();
        expect(
            (container.querySelector('[aria-hidden="true"]') as HTMLElement).style.background,
        ).toContain('radial-gradient');
    });

    it('the still gradient follows the chosen palette', async () => {
        setReducedMotion(true);
        const { container } = render(<FluidGradient showPalettePicker />);
        const placeholder = () =>
            (container.querySelector('[aria-hidden="true"]') as HTMLElement).style.background;

        const before = placeholder();
        screen.getByRole('button', { name: 'Dusk' }).click();

        await vi.waitFor(() => expect(placeholder()).not.toBe(before));
    });
});
