import * as THREE from 'three';

import { config } from './config';
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

const FLUID_MAX_RESOLUTION = 640;

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

export const createRenderer = (container: HTMLElement): THREE.WebGLRenderer => {
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
    });

    const { width, height } = getCanvasSize(container);
    const pixelRatio = getPixelRatio(width, height);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.bottom = '0';
    canvas.style.pointerEvents = 'auto';
    canvas.style.touchAction = 'none';
    canvas.style.zIndex = '1';
    canvas.style.willChange = 'transform';

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
): [THREE.ShaderMaterial, THREE.ShaderMaterial] => {
    const fluidMaterial = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(fluidWidth, fluidHeight) },
            iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
            iFrame: { value: 0 },
            iPreviousFrame: { value: null },
            uBrushSize: { value: config.brushSize },
            uBrushStrength: { value: config.brushStrength },
            uFluidDecay: { value: config.fluidDecay },
            uTrailLength: { value: config.trailLength },
            uStopDecay: { value: config.stopDecay },
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
            uColor1: { value: new THREE.Vector3(...hexToRgb(config.color1)) },
            uColor2: { value: new THREE.Vector3(...hexToRgb(config.color2)) },
            uColor3: { value: new THREE.Vector3(...hexToRgb(config.color3)) },
            uColor4: { value: new THREE.Vector3(...hexToRgb(config.color4)) },
            uColor5: { value: new THREE.Vector3(...hexToRgb(config.color5)) },
            uColor6: { value: new THREE.Vector3(...hexToRgb(config.color6)) },
            uColor7: { value: new THREE.Vector3(...hexToRgb(config.color7)) },
            uColor8: { value: new THREE.Vector3(...hexToRgb(config.color8)) },
            uColorIntensity: { value: config.colorIntensity },
            uSoftness: { value: config.softness },
        },
        vertexShader,
        fragmentShader: displayShader,
    });

    return [fluidMaterial, displayMaterial];
};

export const initializeScene = (container: HTMLElement): SceneState => {
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
    );

    const fluidGeometry = new THREE.PlaneGeometry(2, 2);
    const displayGeometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(fluidGeometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(displayGeometry, displayMaterial);

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
        fluidWidth,
        fluidHeight,
        frameCount: 0,
        mouseX: 0,
        mouseY: 0,
        prevMouseX: 1.0,
        prevMouseY: 1.0,
        lastMoveTime: 0,
        animationId: 0,
    };
};
