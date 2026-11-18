import { afterEach, describe, expect, it, vi } from 'vitest';

import { webglRenderer } from './renderer.ts';

type Gl = {
    getExtension: (name: string) => unknown;
    getParameter: (p: unknown) => string;
    RENDERER: number;
};

/** A fake WebGL context with this renderer name; `fast: false` refuses a fast context. */
const device = ({
    name,
    fast = true,
    webgl = true,
}: {
    name?: string;
    fast?: boolean;
    webgl?: boolean;
}) => {
    const lose = vi.fn();
    const gl: Gl = {
        RENDERER: 7937,
        getExtension: (ext) =>
            ext === 'WEBGL_debug_renderer_info'
                ? { UNMASKED_RENDERER_WEBGL: 37446 }
                : ext === 'WEBGL_lose_context'
                  ? { loseContext: lose }
                  : null,
        getParameter: () => name ?? '',
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((
        _type: string,
        options?: { failIfMajorPerformanceCaveat?: boolean },
    ) => {
        if (!webgl) return null;
        if (options?.failIfMajorPerformanceCaveat && !fast) return null;
        return gl;
    }) as unknown as HTMLCanvasElement['getContext']);
    return { lose };
};

describe('which WebGL renderer the device has', () => {
    afterEach(() => vi.restoreAllMocks());

    it('is hardware on a graphics chip, and the test context is let go', () => {
        const { lose } = device({ name: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' });
        expect(webglRenderer()).toBe('hardware');
        expect(lose).toHaveBeenCalled();
    });

    it.each([
        'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
        'llvmpipe (LLVM 15.0.7, 256 bits)',
        'Microsoft Basic Render Driver',
    ])('is software for %s', (name) => {
        device({ name });
        expect(webglRenderer()).toBe('software');
    });

    it('is software when the browser refuses a fast context', () => {
        device({ name: 'whatever', fast: false });
        expect(webglRenderer()).toBe('software');
    });

    it('is none without WebGL, or if asking throws', () => {
        device({ webgl: false });
        expect(webglRenderer()).toBe('none');

        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
            throw new Error('blocked');
        });
        expect(webglRenderer()).toBe('none');
    });
});
