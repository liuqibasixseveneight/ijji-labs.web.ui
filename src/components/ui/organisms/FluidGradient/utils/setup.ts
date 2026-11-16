import * as THREE from 'three';

import { config, palettes, defaultPaletteKey, type Palette } from './config';
import { hexToRgb } from './hexToRgb';
import type { SceneState } from './types';
import { vertexShader, fluidShader, displayShader } from '../shaders';
import { getPixelRatio } from './handlers';

export const getCanvasSize = (container: HTMLElement | null): { width: number; height: number } => {
    if (!container) {
        return { width: window.innerWidth, height: window.innerHeight };
    }
    const rect = container.getBoundingClientRect();
    return {
        width: rect.width > 0 ? rect.width : window.innerWidth,
        height: rect.height > 0 ? rect.height : window.innerHeight,
    };
};

const FLUID_MAX_RESOLUTION = 512;

export const getFluidResolution = (
    displayWidth: number,
    displayHeight: number,
): { width: number; height: number } => {
    const aspect = displayWidth / displayHeight;
    if (displayWidth >= displayHeight) {
        const w = Math.min(displayWidth, FLUID_MAX_RESOLUTION);
        return { width: Math.round(w), height: Math.round(w / aspect) };
    } else {
        const h = Math.min(displayHeight, FLUID_MAX_RESOLUTION);
        return { width: Math.round(h * aspect), height: Math.round(h) };
    }
};

type WebGLRendererWithDebug = THREE.WebGLRenderer & {
    debug: { checkShaderErrors: boolean };
};

export const createRenderer = (container: HTMLElement): THREE.WebGLRenderer => {
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
    });

    if (renderer.capabilities.isWebGL2) {
        (renderer as WebGLRendererWithDebug).debug.checkShaderErrors = false;
    }

    const { width, height } = getCanvasSize(container);
    const pixelRatio = getPixelRatio(width, height);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.cssText = [
        'width:100%',
        'height:100%',
        'display:block',
        'position:absolute',
        'top:0',
        'left:0',
        'right:0',
        'bottom:0',
        'pointer-events:auto',
        'touch-action:pan-y',
        'z-index:1',
        'will-change:transform',
        'transform:translateZ(0)',
    ].join(';');

    container.appendChild(canvas);

    return renderer;
};

export const getFloatTextureType = (gl: WebGLRenderingContext): THREE.TextureDataType => {
    const hasHalfFloat = !!gl.getExtension('OES_texture_half_float');
    const hasFloat = !!gl.getExtension('OES_texture_float');

    if (hasHalfFloat) return THREE.HalfFloatType;
    if (hasFloat) return THREE.FloatType;
    return THREE.UnsignedByteType;
};

export const createRenderTargets = (
    width: number,
    height: number,
    floatType: THREE.TextureDataType,
): [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget] => {
    const options = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: floatType,
        generateMipmaps: false,
        depthBuffer: false,
        stencilBuffer: false,
    };

    const fluidTarget1 = new THREE.WebGLRenderTarget(width, height, options);
    const fluidTarget2 = new THREE.WebGLRenderTarget(width, height, options);

    return [fluidTarget1, fluidTarget2];
};

export const createMaterials = (
    displayWidth: number,
    displayHeight: number,
    fluidWidth: number,
    fluidHeight: number,
    palette: Palette,
): [THREE.ShaderMaterial, THREE.ShaderMaterial] => {
    const fluidMaterial = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(fluidWidth, fluidHeight) },
            iFrame: { value: 0 },
            iPreviousFrame: { value: null },
            uFluidDecay: { value: config.fluidDecay },
            uTrailLength: { value: config.trailLength },
        },
        vertexShader,
        fragmentShader: fluidShader,
    });

    const displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(displayWidth, displayHeight) },
            iFluid: { value: null },
            uDistortionAmount: { value: config.distortionAmount },
            uColor1: { value: new THREE.Vector3(...hexToRgb(palette.color1)) },
            uColor2: { value: new THREE.Vector3(...hexToRgb(palette.color2)) },
            uColor3: { value: new THREE.Vector3(...hexToRgb(palette.color3)) },
            uColor4: { value: new THREE.Vector3(...hexToRgb(palette.color4)) },
            uColor5: { value: new THREE.Vector3(...hexToRgb(palette.color5)) },
            uColor6: { value: new THREE.Vector3(...hexToRgb(palette.color6)) },
            uColor7: { value: new THREE.Vector3(...hexToRgb(palette.color7)) },
            uColor8: { value: new THREE.Vector3(...hexToRgb(palette.color8)) },
            uColorIntensity: { value: config.colorIntensity },
            uSoftness: { value: config.softness },
        },
        vertexShader,
        fragmentShader: displayShader,
    });

    return [fluidMaterial, displayMaterial];
};

export const applyPaletteToScene = (scene: SceneState, palette: Palette): void => {
    if (scene.destroyed) return;
    const u = scene.displayMaterial.uniforms;
    u.uColor1.value.set(...hexToRgb(palette.color1));
    u.uColor2.value.set(...hexToRgb(palette.color2));
    u.uColor3.value.set(...hexToRgb(palette.color3));
    u.uColor4.value.set(...hexToRgb(palette.color4));
    u.uColor5.value.set(...hexToRgb(palette.color5));
    u.uColor6.value.set(...hexToRgb(palette.color6));
    u.uColor7.value.set(...hexToRgb(palette.color7));
    u.uColor8.value.set(...hexToRgb(palette.color8));
};

export const initializeScene = (container: HTMLElement, palette?: Palette): SceneState => {
    const activePalette = palette ?? palettes[defaultPaletteKey];
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = createRenderer(container);

    const { width, height } = getCanvasSize(container);
    const pixelRatio = getPixelRatio(width, height);
    const displayWidth = Math.round(width * pixelRatio);
    const displayHeight = Math.round(height * pixelRatio);

    const { width: fluidWidth, height: fluidHeight } = getFluidResolution(
        displayWidth,
        displayHeight,
    );

    const gl = renderer.getContext() as WebGLRenderingContext;
    const floatType = getFloatTextureType(gl);

    const [fluidTarget1, fluidTarget2] = createRenderTargets(fluidWidth, fluidHeight, floatType);

    const [fluidMaterial, displayMaterial] = createMaterials(
        displayWidth,
        displayHeight,
        fluidWidth,
        fluidHeight,
        activePalette,
    );

    // Single shared geometry — tracked so cleanup.ts can dispose it
    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);

    // Prime both render targets with an initial fluid frame
    fluidMaterial.uniforms.iPreviousFrame.value = null;

    renderer.setRenderTarget(fluidTarget1);
    renderer.render(fluidPlane, camera);

    renderer.setRenderTarget(fluidTarget2);
    renderer.render(fluidPlane, camera);

    displayMaterial.uniforms.iFluid.value = fluidTarget1.texture;
    renderer.setRenderTarget(null);
    renderer.render(displayPlane, camera);

    return {
        camera,
        renderer,
        fluidTarget1,
        fluidTarget2,
        currentFluidTarget: fluidTarget1,
        previousFluidTarget: fluidTarget2,
        fluidMaterial,
        displayMaterial,
        fluidPlane,
        displayPlane,
        geometry, // ← now tracked
        fluidWidth,
        fluidHeight,
        frameCount: 0,
        animationId: 0,
        destroyed: false, // ← guard flag
    };
};
