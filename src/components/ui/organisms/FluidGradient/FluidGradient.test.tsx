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

// jsdom has no WebGL: say what kind of renderer each test's device has.
const renderer = vi.hoisted(() => ({ webglRenderer: vi.fn(() => 'hardware') }));
vi.mock('./utils/renderer.ts', () => renderer);

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

    it.each(['software', 'none'])(
        'keeps the still gradient when WebGL is %s (no graphics chip): no three.js, no blocking',
        async (kind) => {
            // Drawn on the CPU, the fluid blocked the main thread for seconds on Google's
            // PageSpeed test phone (home mobile scored 69).
            setReducedMotion(false);
            renderer.webglRenderer.mockReturnValue(kind);
            vi.useFakeTimers({ toFake: ['setTimeout', 'requestAnimationFrame'] });
            const idle = window.requestIdleCallback;
            // @ts-expect-error As on WebKit, so the start is timer-driven here.
            delete window.requestIdleCallback;
            vi.spyOn(window.IntersectionObserver.prototype, 'observe').mockImplementation(function (
                this: IntersectionObserver,
            ) {
                (this as unknown as { callback: IntersectionObserverCallback }).callback(
                    [{ isIntersecting: true } as IntersectionObserverEntry],
                    this,
                );
            });

            try {
                render(<FluidGradient />);
                await vi.advanceTimersToNextFrame();
                await vi.advanceTimersToNextFrame();
                await vi.advanceTimersByTimeAsync(300);
                expect(renderer.webglRenderer).toHaveBeenCalled();
                expect(scene.initializeScene).not.toHaveBeenCalled();
            } finally {
                window.requestIdleCallback = idle;
                vi.useRealTimers();
                renderer.webglRenderer.mockReturnValue('hardware');
            }
        },
    );
});
