import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import './index.css';
import { startSmoothScroll } from './lib/smoothScroll.ts';
import { router } from './router';

// Smooth scrolling, unless the visitor has asked their device for less motion.
startSmoothScroll();

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
