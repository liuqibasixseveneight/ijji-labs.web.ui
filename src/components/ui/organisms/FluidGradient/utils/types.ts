import * as THREE from 'three';

export type SceneState = {
    animationId: number;
    camera: THREE.OrthographicCamera;
    cleanupVisibility?: () => void;
    currentFluidTarget: THREE.WebGLRenderTarget;
    displayMaterial: THREE.ShaderMaterial;
    displayPlane: THREE.Mesh;
    fluidHeight: number;
    fluidMaterial: THREE.ShaderMaterial;
    fluidPlane: THREE.Mesh;
    fluidTarget1: THREE.WebGLRenderTarget;
    fluidTarget2: THREE.WebGLRenderTarget;
    fluidWidth: number;
    frameCount: number;
    geometry: THREE.PlaneGeometry; // tracked so cleanup can dispose it
    previousFluidTarget: THREE.WebGLRenderTarget;
    renderer: THREE.WebGLRenderer;
    destroyed: boolean; // guard against post-cleanup callbacks
};
