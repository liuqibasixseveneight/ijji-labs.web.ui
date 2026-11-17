import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import '../index.css';
import { adminRoutes } from './routes.tsx';

// The admin dashboard: its own entry (admin/index.html), rendered in the browser only. The
// edge gate (netlify/edge-functions/admin-gate.ts) serves this page only to the signed-in
// admin, apart from /admin/sign-in.
const router = createBrowserRouter(adminRoutes, { basename: '/admin' });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
