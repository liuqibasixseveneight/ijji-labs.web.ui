import type { SceneState } from './types';

export const createAnimationLoop = (scene: SceneState) => {
    let isPaused = false;

    const handleVisibilityChange = () => {
        isPaused = document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    scene.cleanupVisibility = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    const animate = () => {
        scene.animationId = requestAnimationFrame(animate);

        if (isPaused) return;

        const time = performance.now() * 0.001;
        scene.fluidMaterial.uniforms.iTime.value = time;
        scene.displayMaterial.uniforms.iTime.value = time;

        scene.fluidMaterial.uniforms.iFrame.value = Math.min(scene.frameCount, 2);

        scene.fluidMaterial.uniforms.iPreviousFrame.value = scene.previousFluidTarget.texture;
        scene.renderer.setRenderTarget(scene.currentFluidTarget);
        scene.renderer.render(scene.fluidPlane, scene.camera);

        scene.displayMaterial.uniforms.iFluid.value = scene.currentFluidTarget.texture;
        scene.renderer.setRenderTarget(null);
        scene.renderer.render(scene.displayPlane, scene.camera);

        const temp = scene.currentFluidTarget;
        scene.currentFluidTarget = scene.previousFluidTarget;
        scene.previousFluidTarget = temp;

        if (scene.frameCount < 3) scene.frameCount++;
    };

    return animate;
};
