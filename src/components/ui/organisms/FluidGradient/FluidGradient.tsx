import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import {
    cleanupScene,
    createAnimationLoop,
    createMouseLeaveHandler,
    createMouseMoveHandler,
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

        const handleMouseMove = createMouseMoveHandler(scene);
        const handleMouseLeave = createMouseLeaveHandler(scene);
        const handleResize = createResizeHandler(scene, canvasElement);
        const animate = createAnimationLoop(scene);

        canvasElement.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvasElement.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize, { passive: true });

        animate();

        return () => {
            if (!sceneRef.current) return;

            cancelAnimationFrame(sceneRef.current.animationId);
            sceneRef.current.cleanupVisibility?.();
            window.removeEventListener('resize', handleResize);
            canvasElement.removeEventListener('mousemove', handleMouseMove);
            canvasElement.removeEventListener('mouseleave', handleMouseLeave);
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
        <div className='absolute top-0 left-0 w-full h-full z-0'>
            <div ref={canvasRef} className='w-full h-full' />

            {showPalettePicker && (
                <nav className='absolute bottom-0 left-0 right-0 h-[10vh] z-10'>
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
