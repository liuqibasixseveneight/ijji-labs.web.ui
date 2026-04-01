import type { SceneState } from './types';

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

export const createMouseMoveHandler = (scene: SceneState) => {
    return (e: MouseEvent) => {
        const rect = scene.renderer.domElement.getBoundingClientRect();
        const mouseXInCanvas = e.clientX - rect.left;
        const mouseYInCanvas = e.clientY - rect.top;

        if (rect.width === 0 || rect.height === 0) return;

        const resolution = scene.fluidMaterial.uniforms.iResolution.value;

        const mouseX = (mouseXInCanvas / rect.width) * resolution.x;
        const mouseY = ((rect.height - mouseYInCanvas) / rect.height) * resolution.y;

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
            const newRenderWidth = Math.round(newWidth * newPixelRatio);
            const newRenderHeight = Math.round(newHeight * newPixelRatio);

            scene.renderer.setPixelRatio(newPixelRatio);
            scene.renderer.setSize(newWidth, newHeight);
            scene.fluidMaterial.uniforms.iResolution.value.set(newRenderWidth, newRenderHeight);
            scene.displayMaterial.uniforms.iResolution.value.set(newRenderWidth, newRenderHeight);

            scene.fluidTarget1.setSize(newRenderWidth, newRenderHeight);
            scene.fluidTarget2.setSize(newRenderWidth, newRenderHeight);

            scene.frameCount = 0;
        }, 150);
    };
};
