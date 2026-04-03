import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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

export const FluidGradient = ({
    palette,
    showPalettePicker = false,
    onPaletteChange,
}: FluidGradientProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneState | null>(null);

    const [activePaletteKey, setActivePaletteKey] = useState<PaletteKey>(
        typeof palette === 'string' ? palette : defaultPaletteKey,
    );

    const activePalette = useMemo(() => {
        return resolvePalette(showPalettePicker ? activePaletteKey : palette);
    }, [showPalettePicker, activePaletteKey, palette]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvasElement = canvasRef.current;
        const scene = initializeScene(canvasElement, activePalette);
        sceneRef.current = scene;

        const handleResize = createResizeHandler(scene, canvasElement);
        const animate = createAnimationLoop(scene);

        window.addEventListener('resize', handleResize, { passive: true });

        animate();

        return () => {
            if (!sceneRef.current) return;

            cancelAnimationFrame(sceneRef.current.animationId);
            sceneRef.current.cleanupVisibility?.();
            window.removeEventListener('resize', handleResize);
            cleanupScene(sceneRef.current, canvasElement);
            sceneRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className='absolute inset-0 z-0 pointer-events-none'>
            <div ref={canvasRef} className='w-full h-full touch-pan-y pointer-events-auto' />

            {showPalettePicker && (
                <nav className='absolute bottom-0 left-0 right-0 h-[10vh] z-10 pointer-events-auto'>
                    <div className='flex items-center justify-end h-full w-full max-w-380 mx-auto px-8'>
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
