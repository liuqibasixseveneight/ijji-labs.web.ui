import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createResizeHandler } from './handlers.ts';
import type { SceneState } from './types.ts';

/** Just the parts of a scene the resize handler touches, with spies to see a rebuild. */
const fakeScene = () => {
    const vector = () => ({ set: vi.fn() });
    return {
        destroyed: false,
        frameCount: 3,
        renderer: { setPixelRatio: vi.fn(), setSize: vi.fn() },
        fluidMaterial: { uniforms: { iResolution: { value: vector() } } },
        displayMaterial: { uniforms: { iResolution: { value: vector() } } },
        fluidTarget1: { setSize: vi.fn() },
        fluidTarget2: { setSize: vi.fn() },
    };
};

const box = (width: number, height: number) => {
    const container = document.createElement('div');
    const size = { width, height };
    container.getBoundingClientRect = () => ({ ...size }) as DOMRect;
    return { container, size };
};

const setTouch = (touch: boolean) => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: touch }) as never;
};

describe('the hero resize handler', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const run = (touch: boolean, from: [number, number], to: [number, number]) => {
        setTouch(touch);
        const scene = fakeScene();
        const { container, size } = box(...from);
        const handler = createResizeHandler(scene as unknown as SceneState, container);

        [size.width, size.height] = to;
        handler();
        vi.advanceTimersByTime(200);
        return scene;
    };

    it("leaves the fluid alone when a resize event comes but the hero hasn't changed size", () => {
        // The first resize used to rebuild whatever happened, wiping the fluid to flat colour.
        const scene = run(true, [375, 812], [375, 812]);

        expect(scene.renderer.setSize).not.toHaveBeenCalled();
        expect(scene.frameCount).toBe(3);
    });

    it('on a phone, ignores the address bar showing or hiding (a small change in height)', () => {
        const scene = run(true, [375, 812], [375, 868]);

        expect(scene.renderer.setSize).not.toHaveBeenCalled();
        expect(scene.frameCount).toBe(3);
    });

    it('on a phone, still rebuilds when it rotates', () => {
        const scene = run(true, [375, 812], [812, 375]);

        expect(scene.renderer.setSize).toHaveBeenCalledWith(812, 375);
    });

    it('with a mouse, rebuilds for any change in size', () => {
        const scene = run(false, [1280, 800], [1280, 760]);

        expect(scene.renderer.setSize).toHaveBeenCalledWith(1280, 760);
    });
});
