import type { SceneState } from './types';

const TIME_WRAP = Math.PI * 2 * 100;

export const createAnimationLoop = (scene: SceneState) => {
    let shaderTime = 0;
    let lastRafTime: number | null = null;
    let rafHandle: number | null = null;

    const stop = () => {
        if (rafHandle !== null) {
            cancelAnimationFrame(rafHandle);
            rafHandle = null;
            scene.animationId = 0;
        }
        lastRafTime = null;
    };

    const animate = () => {
        // Always bail immediately if the scene has been torn down
        if (scene.destroyed) {
            rafHandle = null;
            scene.animationId = 0;
            return;
        }

        rafHandle = requestAnimationFrame(animate);
        scene.animationId = rafHandle;

        const now = performance.now();
        if (lastRafTime !== null) {
            const delta = Math.min((now - lastRafTime) * 0.001, 0.1);
            shaderTime = (shaderTime + delta) % TIME_WRAP;
        }
        lastRafTime = now;

        const fluidUniforms = scene.fluidMaterial.uniforms;
        const displayUniforms = scene.displayMaterial.uniforms;

        fluidUniforms.iTime.value = shaderTime;
        displayUniforms.iTime.value = shaderTime;
        fluidUniforms.iFrame.value = Math.min(scene.frameCount, 2);
        fluidUniforms.iPreviousFrame.value = scene.previousFluidTarget.texture;

        const renderer = scene.renderer;
        renderer.setRenderTarget(scene.currentFluidTarget);
        renderer.render(scene.fluidPlane, scene.camera);

        displayUniforms.iFluid.value = scene.currentFluidTarget.texture;
        renderer.setRenderTarget(null);
        renderer.render(scene.displayPlane, scene.camera);

        const temp = scene.currentFluidTarget;
        scene.currentFluidTarget = scene.previousFluidTarget;
        scene.previousFluidTarget = temp;

        if (scene.frameCount < 3) scene.frameCount++;
    };

    const start = () => {
        if (scene.destroyed) return;
        scene.frameCount = 0;
        if (rafHandle === null) {
            animate();
        }
    };

    const handleVisibilityChange = () => {
        if (scene.destroyed) {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            return;
        }
        if (document.hidden) stop();
        else start();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    scene.cleanupVisibility = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        stop();
    };

    return animate;
};
