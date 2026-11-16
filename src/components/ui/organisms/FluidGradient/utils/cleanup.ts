import type { SceneState } from './types';

export const cleanupScene = (scene: SceneState | null, container: HTMLElement | null): void => {
    if (!scene) return;

    // Mark as destroyed immediately so any in-flight callbacks bail out
    scene.destroyed = true;

    if (scene.renderer.domElement) {
        const canvas = scene.renderer.domElement;
        if (container && container.contains(canvas)) {
            container.removeChild(canvas);
        }
    }

    scene.geometry.dispose();
    scene.fluidMaterial.dispose();
    scene.displayMaterial.dispose();
    scene.fluidTarget1.dispose();
    scene.fluidTarget2.dispose();

    // Explicitly lose the WebGL context before disposing the renderer.
    // renderer.dispose() clears Three.js internal caches but does NOT release
    // the WebGL context itself. Browsers cap simultaneous contexts at ~8-16;
    // without this, repeated mount/unmount cycles silently accumulate live
    // contexts until the browser falls back to software rendering.
    const gl = scene.renderer.getContext();
    const ext = gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();

    scene.renderer.dispose();
};
