import type { SceneState } from './types';

export const cleanupScene = (
  scene: SceneState | null,
  container: HTMLElement | null
): void => {
  if (!scene) return;

  if (scene.renderer.domElement) {
    const canvas = scene.renderer.domElement;
    if (container && container.contains(canvas)) {
      container.removeChild(canvas);
    }
  }

  scene.renderer.dispose();
  scene.fluidMaterial.dispose();
  scene.displayMaterial.dispose();
  scene.fluidTarget1.dispose();
  scene.fluidTarget2.dispose();
};





