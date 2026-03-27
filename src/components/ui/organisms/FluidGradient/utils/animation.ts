import type { SceneState } from './types';

export const createAnimationLoop = (scene: SceneState) => {
  const animate = () => {
    scene.animationId = requestAnimationFrame(animate);

    const time = performance.now() * 0.001;
    scene.fluidMaterial.uniforms.iTime.value = time;
    scene.displayMaterial.uniforms.iTime.value = time;
    scene.fluidMaterial.uniforms.iFrame.value = scene.frameCount;

    const mouseUniform = scene.fluidMaterial.uniforms.iMouse.value;

    if (scene.lastMoveTime > 0) {
      const timeSinceMove = performance.now() - scene.lastMoveTime;

      if (timeSinceMove > 3000) {
        mouseUniform.set(0, 0, 0, 0);
        scene.lastMoveTime = 0;
        scene.mouseX = 0;
        scene.mouseY = 0;
        scene.prevMouseX = 1.0;
        scene.prevMouseY = 1.0;
      } else {
        const prevX =
          scene.prevMouseX > 0.01
            ? scene.prevMouseX
            : Math.max(scene.mouseX - 100, 1.0);
        const prevY =
          scene.prevMouseY > 0.01
            ? scene.prevMouseY
            : Math.max(scene.mouseY - 100, 1.0);
        mouseUniform.set(scene.mouseX, scene.mouseY, prevX, prevY);
        scene.fluidMaterial.needsUpdate = true;
      }
    } else {
      mouseUniform.set(0, 0, 0, 0);
    }

    scene.fluidMaterial.uniforms.iPreviousFrame.value =
      scene.previousFluidTarget.texture;
    scene.renderer.setRenderTarget(scene.currentFluidTarget);
    scene.renderer.render(scene.fluidPlane, scene.camera);

    scene.displayMaterial.uniforms.iFluid.value =
      scene.currentFluidTarget.texture;
    scene.renderer.setRenderTarget(null);
    scene.renderer.render(scene.displayPlane, scene.camera);

    const temp = scene.currentFluidTarget;
    scene.currentFluidTarget = scene.previousFluidTarget;
    scene.previousFluidTarget = temp;

    scene.frameCount++;
  };

  return animate;
};
