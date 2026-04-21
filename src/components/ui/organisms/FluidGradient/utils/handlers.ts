import type { SceneState } from './types';
import { getFluidResolution } from './setup';

export const getPixelRatio = (width: number, height: number): number => {
    const dpr = window.devicePixelRatio || 1;
    const capped = Math.min(dpr, 2);
    const maxResolution = 1920 * 1080;
    const screenPixels = width * height;

    if (screenPixels * capped * capped > maxResolution) {
        return Math.sqrt(maxResolution / screenPixels);
    }

    return capped;
};

export const createResizeHandler = (scene: SceneState, container: HTMLElement) => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    let visibilityListener: (() => void) | null = null;

    const applyResize = () => {
        debounceTimer = null;
        visibilityListener = null;

        // Don't touch a scene that's already been torn down
        if (scene.destroyed) return;

        const rect = container.getBoundingClientRect();
        const newWidth = rect.width || window.innerWidth;
        const newHeight = rect.height || window.innerHeight;

        if (newWidth === lastWidth && newHeight === lastHeight) return;
        lastWidth = newWidth;
        lastHeight = newHeight;

        const newPixelRatio = getPixelRatio(newWidth, newHeight);
        const newDisplayWidth = Math.round(newWidth * newPixelRatio);
        const newDisplayHeight = Math.round(newHeight * newPixelRatio);

        const { width: newFluidWidth, height: newFluidHeight } = getFluidResolution(
            newDisplayWidth,
            newDisplayHeight,
        );

        scene.renderer.setPixelRatio(newPixelRatio);
        scene.renderer.setSize(newWidth, newHeight);

        scene.fluidMaterial.uniforms.iResolution.value.set(newFluidWidth, newFluidHeight);
        scene.displayMaterial.uniforms.iResolution.value.set(newDisplayWidth, newDisplayHeight);

        scene.fluidTarget1.setSize(newFluidWidth, newFluidHeight);
        scene.fluidTarget2.setSize(newFluidWidth, newFluidHeight);

        scene.frameCount = 0;
    };

    const handler = () => {
        if (scene.destroyed) return;

        // Clear any pending debounce
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        // Clear any pending visibility listener
        if (visibilityListener !== null) {
            document.removeEventListener('visibilitychange', visibilityListener);
            visibilityListener = null;
        }

        if (document.hidden) {
            visibilityListener = () => {
                if (visibilityListener) {
                    document.removeEventListener('visibilitychange', visibilityListener);
                    visibilityListener = null;
                }
                if (!scene.destroyed) applyResize();
            };
            document.addEventListener('visibilitychange', visibilityListener);
            return;
        }

        debounceTimer = setTimeout(applyResize, 150);
    };

    // Expose a cancel method so the component can kill in-flight timers on unmount
    handler.cancel = () => {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        if (visibilityListener !== null) {
            document.removeEventListener('visibilitychange', visibilityListener);
            visibilityListener = null;
        }
    };

    return handler;
};
