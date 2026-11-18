/** Renderer names of WebGL drawn on the CPU rather than a graphics chip. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|offscreen/i;

/**
 * Whether WebGL here runs on a graphics chip ('hardware'), is drawn on the CPU ('software':
 * SwiftShader and the like, used where there's no GPU, as in Google's PageSpeed test runs and
 * some low-end or locked-down devices), or isn't available ('none').
 *
 * The fluid simulation runs every frame; drawn on the CPU it blocks the main thread for
 * seconds (it cost the home page about 30 Lighthouse points on mobile), so only 'hardware'
 * gets it. Everyone else keeps the still gradient, as reduced-motion visitors do.
 *
 * Checked with a throwaway context: `failIfMajorPerformanceCaveat` makes browsers refuse a
 * software context, and the renderer's name catches the ones that don't.
 */
export const webglRenderer = (): 'hardware' | 'software' | 'none' => {
    try {
        const canvas = document.createElement('canvas');
        const fast =
            canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
            canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });

        if (!fast) {
            const any = document.createElement('canvas').getContext('webgl');
            any?.getExtension('WEBGL_lose_context')?.loseContext();
            return any ? 'software' : 'none';
        }

        const info = fast.getExtension('WEBGL_debug_renderer_info');
        const name = String(
            info
                ? fast.getParameter(info.UNMASKED_RENDERER_WEBGL)
                : fast.getParameter(fast.RENDERER),
        );
        fast.getExtension('WEBGL_lose_context')?.loseContext();
        return SOFTWARE.test(name) ? 'software' : 'hardware';
    } catch {
        return 'none';
    }
};
