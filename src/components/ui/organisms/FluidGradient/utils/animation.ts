import type { SceneState } from './types';

const TIME_WRAP = Math.PI * 2 * 100;

export const createAnimationLoop = (scene: SceneState) => {
    let totalPausedTime = 0;
    let pausedAt: number | null = null;
    let rafHandle: number | null = null;

    const animate = () => {
        rafHandle = requestAnimationFrame(animate);
        scene.animationId = rafHandle;

        const rawTime = (performance.now() - totalPausedTime) * 0.001;
        const time = rawTime % TIME_WRAP;

        const fluidUniforms = scene.fluidMaterial.uniforms;
        const displayUniforms = scene.displayMaterial.uniforms;

        fluidUniforms.iTime.value = time;
        displayUniforms.iTime.value = time;
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

    const stop = () => {
        if (rafHandle !== null) {
            cancelAnimationFrame(rafHandle);
            rafHandle = null;
            scene.animationId = 0;
        }
        pausedAt = performance.now();
    };

    const start = () => {
        if (pausedAt !== null) {
            totalPausedTime += performance.now() - pausedAt;
            pausedAt = null;
        }
        scene.frameCount = 0;
        if (rafHandle === null) {
            animate();
        }
    };

    const handleVisibilityChange = () => {
        if (document.hidden) stop();
        else start();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    scene.cleanupVisibility = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (rafHandle !== null) {
            cancelAnimationFrame(rafHandle);
            rafHandle = null;
        }
    };

    return animate;
};
