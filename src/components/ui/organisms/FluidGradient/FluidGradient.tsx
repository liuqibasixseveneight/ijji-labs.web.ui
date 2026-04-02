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
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneState | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvasElement = canvasRef.current;
        const containerElement = containerRef.current;

        const scene = initializeScene(canvasElement);
        sceneRef.current = scene;

        const handleMouseMove = createMouseMoveHandler(scene);
        const handleMouseLeave = createMouseLeaveHandler(scene);

        const resizeObserver = createResizeHandler(scene, containerElement);

        const animationControl = { isIntersecting: true };
        const animate = createAnimationLoop(scene, animationControl);

        canvasElement.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvasElement.addEventListener('mouseleave', handleMouseLeave);

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                animationControl.isIntersecting = entry.isIntersecting;
            },
            { threshold: 0 },
        );
        intersectionObserver.observe(containerElement);

        animate();

        return () => {
            if (sceneRef.current) {
                cancelAnimationFrame(sceneRef.current.animationId);
                sceneRef.current.cleanupVisibility?.();

                resizeObserver.disconnect();
                intersectionObserver.disconnect();

                canvasElement.removeEventListener('mousemove', handleMouseMove);
                canvasElement.removeEventListener('mouseleave', handleMouseLeave);

                cleanupScene(sceneRef.current, canvasElement);
                sceneRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={containerRef} className='absolute top-0 left-0 w-full h-full z-0'>
            <div ref={canvasRef} className='w-full h-full' />
        </div>
    );
};
