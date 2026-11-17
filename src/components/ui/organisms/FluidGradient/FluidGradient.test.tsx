import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FluidGradient } from './FluidGradient.tsx';

// three.js can't run in jsdom: stand in for the scene so we can see when WebGL would start.
const scene = vi.hoisted(() => ({
    initializeScene: vi.fn(() => ({ destroyed: false })),
    createResizeHandler: vi.fn(() => Object.assign(() => {}, { cancel: () => {} })),
    createAnimationLoop: vi.fn(() => () => {}),
    cleanupScene: vi.fn(),
    applyPaletteToScene: vi.fn(),
}));
vi.mock('./utils/scene', () => scene);

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

    it('on WebKit (no requestIdleCallback), starts WebGL only after the page has painted', async () => {
        // Starting at once left the text and navbar unpainted on iPhones until the first scroll.
        setReducedMotion(false);
        vi.useFakeTimers({ toFake: ['setTimeout', 'requestAnimationFrame'] });
        const idle = window.requestIdleCallback;
        // @ts-expect-error WebKit has none.
        delete window.requestIdleCallback;
        vi.spyOn(window.IntersectionObserver.prototype, 'observe').mockImplementation(function (
            this: IntersectionObserver,
        ) {
            // The hero is on screen straight away.
            (this as unknown as { callback: IntersectionObserverCallback }).callback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                this,
            );
        });

        try {
            render(<FluidGradient />);
            await vi.advanceTimersByTimeAsync(0);
            expect(scene.initializeScene).not.toHaveBeenCalled();

            // Two frames, then a beat.
            await vi.advanceTimersToNextFrame();
            await vi.advanceTimersToNextFrame();
            await vi.advanceTimersByTimeAsync(249);
            expect(scene.initializeScene).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);
            await vi.waitFor(() => expect(scene.initializeScene).toHaveBeenCalledOnce());
        } finally {
            window.requestIdleCallback = idle;
            vi.useRealTimers();
        }
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
