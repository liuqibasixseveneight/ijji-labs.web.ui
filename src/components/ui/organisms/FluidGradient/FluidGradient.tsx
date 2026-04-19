import { useEffect, useRef, useState, useCallback, useMemo, useEffectEvent } from 'react';

import {
    cleanupScene,
    createAnimationLoop,
    createResizeHandler,
    initializeScene,
    applyPaletteToScene,
    palettes,
    defaultPaletteKey,
    type Palette,
    type SceneState,
} from './utils';
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
    const cleanupRef = useRef<(() => void) | null>(null);
    const [webglReady, setWebglReady] = useState(false);

    const [activePaletteKey, setActivePaletteKey] = useState<PaletteKey>(
        typeof palette === 'string' ? palette : defaultPaletteKey,
    );

    const activePalette = useMemo(
        () => resolvePalette(showPalettePicker ? activePaletteKey : palette),
        [showPalettePicker, activePaletteKey, palette],
    );

    const [placeholderGradient] = useState(() => buildPlaceholderGradient(activePalette));

    const onSceneReady = useEffectEvent((canvasElement: HTMLDivElement) => {
        const scene = initializeScene(canvasElement, activePalette);
        sceneRef.current = scene;

        const handleResize = createResizeHandler(scene, canvasElement);
        const animate = createAnimationLoop(scene);

        window.addEventListener('resize', handleResize, { passive: true });
        animate();

        setTimeout(() => setWebglReady(true), 150);

        cleanupRef.current = () => {
            sceneRef.current?.cleanupVisibility?.();
            window.removeEventListener('resize', handleResize);
            cleanupScene(sceneRef.current, canvasElement);
            sceneRef.current = null;
        };
    });

    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        let initialised = false;

        const initScene = () => {
            if (initialised || !canvasElement) return;
            initialised = true;

            const run = () => onSceneReady(canvasElement);

            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(run, { timeout: 2000 });
            } else {
                setTimeout(run, 0);
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
            observer.disconnect();
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (sceneRef.current) {
            applyPaletteToScene(sceneRef.current, activePalette);
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
        <div className='absolute inset-0 z-0 pointer-events-none contain-strict'>
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
                <nav className='absolute bottom-0 left-0 right-0 h-[10vh] z-10 pointer-events-auto'>
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
