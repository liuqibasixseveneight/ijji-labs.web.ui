import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { palettes, defaultPaletteKey, type Palette, type SceneState } from './utils';
import type * as SceneModule from './utils/scene';
import type { FluidGradientProps } from './types.ts';
import { type PaletteKey, PalettePicker } from '../../molecules';

const resolvePalette = (palette: PaletteKey | Palette | undefined): Palette => {
    if (!palette) return palettes[defaultPaletteKey];
    if (typeof palette === 'string') return palettes[palette] ?? palettes[defaultPaletteKey];
    return palette;
};

const buildPlaceholderGradient = (palette: Palette): string =>
    `radial-gradient(ellipse at 60% 40%, ${palette.color3} 0%, ${palette.color1} 60%, ${palette.color2} 100%)`;

export const FluidGradient = ({
    palette,
    showPalettePicker = false,
    onPaletteChange,
}: FluidGradientProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneState | null>(null);
    const sceneModuleRef = useRef<typeof SceneModule | null>(null);
    const [webglReady, setWebglReady] = useState(false);

    const [activePaletteKey, setActivePaletteKey] = useState<PaletteKey>(
        typeof palette === 'string' ? palette : defaultPaletteKey,
    );

    const activePalette = useMemo(
        () => resolvePalette(showPalettePicker ? activePaletteKey : palette),
        [showPalettePicker, activePaletteKey, palette],
    );

    // The still gradient shown until WebGL starts, and instead of it for reduced motion.
    const placeholderGradient = buildPlaceholderGradient(activePalette);

    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        // No moving fluid for people who ask for less motion: the still gradient stays.
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        let initialised = false;
        let idleHandle: number | undefined;
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        let resizeHandler: ReturnType<typeof SceneModule.createResizeHandler> | null = null;
        let cancelled = false;

        const initScene = () => {
            if (initialised || !canvasElement) return;
            initialised = true;

            const run = async () => {
                // Bail if the component already unmounted while we were waiting
                if (!canvasRef.current) return;

                const sceneModule = await import('./utils/scene');
                if (cancelled || !canvasRef.current) return;
                sceneModuleRef.current = sceneModule;
                const { createAnimationLoop, createResizeHandler, initializeScene } = sceneModule;

                const scene = initializeScene(canvasElement, activePalette);
                sceneRef.current = scene;

                resizeHandler = createResizeHandler(scene, canvasElement);
                const animate = createAnimationLoop(scene);

                window.addEventListener('resize', resizeHandler, { passive: true });
                animate();

                setTimeout(() => {
                    if (!scene.destroyed) setWebglReady(true);
                }, 150);
            };

            if (typeof requestIdleCallback !== 'undefined') {
                idleHandle = requestIdleCallback(() => void run(), { timeout: 2000 });
            } else {
                timeoutHandle = setTimeout(() => void run(), 0);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    initScene();
                    observer.disconnect();
                }
            },
            { threshold: 0.01 },
        );

        observer.observe(canvasElement);

        return () => {
            cancelled = true;
            observer.disconnect();

            // Cancel any pending idle/timeout init
            if (idleHandle !== undefined) {
                cancelIdleCallback(idleHandle);
                idleHandle = undefined;
            }
            if (timeoutHandle !== undefined) {
                clearTimeout(timeoutHandle);
                timeoutHandle = undefined;
            }

            // Remove resize listener and cancel any in-flight debounce
            if (resizeHandler !== null) {
                window.removeEventListener('resize', resizeHandler);
                resizeHandler.cancel();
                resizeHandler = null;
            }

            // Stop RAF + visibilitychange listener, then dispose all GPU resources
            const scene = sceneRef.current;
            if (scene) {
                scene.cleanupVisibility?.();
                sceneModuleRef.current?.cleanupScene(scene, canvasElement);
                sceneRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Palette changes after mount — just update uniforms, no re-init needed
    useEffect(() => {
        if (sceneRef.current) {
            sceneModuleRef.current?.applyPaletteToScene(sceneRef.current, activePalette);
        }
    }, [activePalette]);

    const handlePaletteChange = useCallback(
        (key: PaletteKey) => {
            setActivePaletteKey(key);
            onPaletteChange?.(palettes[key]);
        },
        [onPaletteChange],
    );

    return (
        // The still gradient also sits behind the canvas, so if the canvas is ever smaller than
        // its box (a phone's address bar sliding away mid-resize), the gap shows the gradient,
        // not white.
        <div
            className='absolute inset-0 z-0 pointer-events-none contain-strict'
            style={{ background: placeholderGradient }}
        >
            <div
                aria-hidden='true'
                className={`absolute inset-0 z-2 pointer-events-none transition-opacity duration-700 ease-out ${webglReady ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: placeholderGradient }}
            />

            <div
                ref={canvasRef}
                className={`w-full h-full touch-pan-y pointer-events-auto transition-opacity duration-700 ease-in ${webglReady ? 'opacity-100' : 'opacity-0'}`}
            />

            {showPalettePicker && (
                <nav className='absolute bottom-0 left-0 right-0 h-[clamp(64px,10vh,100px)] z-10 pointer-events-auto'>
                    <div className='flex items-center justify-end h-full w-full max-w-380 mx-auto px-6 md:px-8'>
                        <PalettePicker
                            activeKey={activePaletteKey}
                            onChange={handlePaletteChange}
                        />
                    </div>
                </nav>
            )}
        </div>
    );
};
