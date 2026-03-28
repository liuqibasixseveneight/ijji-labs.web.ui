import { useEffect, useRef } from 'react';

import {
    cleanupScene,
    createAnimationLoop,
    createMouseLeaveHandler,
    createMouseMoveHandler,
    createResizeHandler,
    initializeScene,
    type SceneState,
} from './utils';

export const FluidGradient = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneState | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvasElement = canvasRef.current; // ✅ copy ref locally
        const scene = initializeScene(canvasElement);
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
            if (sceneRef.current) {
                cancelAnimationFrame(sceneRef.current.animationId);
                window.removeEventListener('resize', handleResize);

                canvasElement.removeEventListener('mousemove', handleMouseMove);
                canvasElement.removeEventListener('mouseleave', handleMouseLeave);

                cleanupScene(sceneRef.current, canvasElement);
                sceneRef.current = null;
            }
        };
    }, []);

    return (
        <div className='absolute top-0 left-0 w-full h-full z-0'>
            <div ref={canvasRef} className='w-full h-full' />
        </div>
    );
};
