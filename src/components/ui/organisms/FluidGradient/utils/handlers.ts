import type { SceneState } from './types';
import { getFluidResolution } from './setup';

export const getPixelRatio = (width: number, height: number): number => {
    const basePixelRatio = window.devicePixelRatio || 1;
    const maxResolution = 2560 * 1440;
    const screenPixels = width * height;
    const ratio = Math.min(basePixelRatio, 1.5);

    if (screenPixels * ratio * ratio > maxResolution) {
        return Math.sqrt(maxResolution / screenPixels);
    }

    return ratio;
};

export const createMouseMoveHandler = (scene: SceneState) => {
    return (e: MouseEvent) => {
        const mouseXInCanvas = e.offsetX;
        const mouseYInCanvas = e.offsetY;

        const width = scene.renderer.domElement.clientWidth || window.innerWidth;
        const height = scene.renderer.domElement.clientHeight || window.innerHeight;

        if (width === 0 || height === 0) return;

        const fluidRes = scene.fluidMaterial.uniforms.iResolution.value;

        const mouseX = (mouseXInCanvas / width) * fluidRes.x;
        const mouseY = ((height - mouseYInCanvas) / height) * fluidRes.y;

        const oldMouseX = scene.mouseX;
        const oldMouseY = scene.mouseY;

        let prevMouseX: number;
        let prevMouseY: number;

        if (oldMouseX === 0 && oldMouseY === 0) {
            prevMouseX = Math.max(mouseX - 100, 1.0);
            prevMouseY = Math.max(mouseY - 100, 1.0);
        } else {
            prevMouseX = oldMouseX;
            prevMouseY = oldMouseY;
        }

        scene.prevMouseX = prevMouseX;
        scene.prevMouseY = prevMouseY;
        scene.mouseX = mouseX;
        scene.mouseY = mouseY;
        scene.lastMoveTime = performance.now();

        const mouseUniform = scene.fluidMaterial.uniforms.iMouse.value;
        mouseUniform.set(mouseX, mouseY, prevMouseX, prevMouseY);
    };
};

export const createMouseLeaveHandler = (scene: SceneState) => {
    return () => {
        scene.fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
        scene.lastMoveTime = 0;
        scene.mouseX = 0;
        scene.mouseY = 0;
        scene.prevMouseX = 1.0;
        scene.prevMouseY = 1.0;
    };
};

export const createResizeHandler = (scene: SceneState, container: HTMLElement) => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            const entry = entries[0];
            if (!entry) return;

            const newWidth = entry.contentRect.width;
            const newHeight = entry.contentRect.height;

            if (newWidth === 0 || newHeight === 0) return;

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
    });

    observer.observe(container);
    return observer;
};
