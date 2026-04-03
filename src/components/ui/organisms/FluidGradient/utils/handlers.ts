import type { SceneState } from './types';
import { getFluidResolution } from './setup';

export const getPixelRatio = (width: number, height: number): number => {
    const basePixelRatio = window.devicePixelRatio || 1;
    const maxResolution = 1920 * 1080;
    const screenPixels = width * height;
    const ratio = Math.min(basePixelRatio, 1);

    if (screenPixels * ratio * ratio > maxResolution) {
        return Math.sqrt(maxResolution / screenPixels);
    }

    return ratio;
};

export const createResizeHandler = (scene: SceneState, container: HTMLElement) => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    return () => {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            debounceTimer = null;

            const rect = container.getBoundingClientRect();
            const newWidth = rect.width || window.innerWidth;
            const newHeight = rect.height || window.innerHeight;
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
        }, 150);
    };
};
