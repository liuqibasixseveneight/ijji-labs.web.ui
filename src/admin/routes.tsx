import { redirect, type RouteObject } from 'react-router-dom';

import { getMe } from './api.ts';
import { AdminLayout } from './components/AdminLayout.tsx';
import { AdminNotFound } from './pages/AdminNotFound.tsx';
import { Overview } from './pages/Overview.tsx';
import { SignIn } from './pages/SignIn.tsx';

/** Admin paths, under the router's `/admin` basename. Never linked from the public site. */
export const adminPaths = { overview: '/', signIn: '/sign-in' } as const;

/** Every page but sign-in needs a session; without one, it's off to sign in. */
export const requireAdmin = async () => {
    const me = await getMe();
    if (!me) throw redirect(adminPaths.signIn);
    return me;
};

/**
 * The dashboard's own routes. Not part of src/router/routes.tsx, so nothing here is
 * pre-rendered, in the sitemap, in llms.txt or on the screen map.
 */
export const adminRoutes: RouteObject[] = [
    { path: adminPaths.signIn, element: <SignIn /> },
    {
        path: '/',
        id: 'admin',
        loader: requireAdmin,
        element: <AdminLayout />,
        children: [
            { index: true, element: <Overview /> },
            { path: '*', element: <AdminNotFound /> },
        ],
    },
];
