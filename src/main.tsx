import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import Lenis from 'lenis';

import './index.css';
import { router } from './router';

// Smooth scrolling, unless the visitor has asked their device for less motion.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
}

const container = document.getElementById('root')!;
const app = (
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);

// Built pages arrive already rendered (scripts/prerender.mjs), so React takes them over.
// In development the root is empty and React renders from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
