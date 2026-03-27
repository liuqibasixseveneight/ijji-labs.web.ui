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

        const scene = initializeScene(canvasRef.current);
        sceneRef.current = scene;

        const handleMouseMove = createMouseMoveHandler(scene);
        const handleMouseLeave = createMouseLeaveHandler(scene);
        const handleResize = createResizeHandler(scene, canvasRef.current);
        const animate = createAnimationLoop(scene);

        const canvas = scene.renderer.domElement;
        canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvas.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize, { passive: true });

        animate();

        return () => {
            if (sceneRef.current) {
                cancelAnimationFrame(sceneRef.current.animationId);
                window.removeEventListener('resize', handleResize);

                if (canvas) {
                    canvas.removeEventListener('mousemove', handleMouseMove);
                    canvas.removeEventListener('mouseleave', handleMouseLeave);
                }

                cleanupScene(sceneRef.current, canvasRef.current);
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
