import { redirect, type ActionFunctionArgs, type RouteObject } from 'react-router-dom';

import { changeDeletionRequest, getDeletionRequests, getMe } from './api.ts';
import { AdminLayout } from './components/AdminLayout.tsx';
import { STATUSES, type Status } from './deletionRequests.ts';
import { adminPaths } from './paths.ts';
import { AdminNotFound } from './pages/AdminNotFound.tsx';
import { DeletionRequest } from './pages/DeletionRequest.tsx';
import { DeletionRequests } from './pages/DeletionRequests.tsx';
import { Overview } from './pages/Overview.tsx';
import { SignIn } from './pages/SignIn.tsx';

/**
 * Every page but sign-in needs a session; without one, it's off to sign in. The deletion
 * requests load with it, so every page can show how many are open.
 */
export const requireAdmin = async () => {
    const [me, deletions] = await Promise.all([getMe(), getDeletionRequests()]);
    if (!me) throw redirect(adminPaths.signIn);
    return { me, deletions };
};

export type AdminData = Awaited<ReturnType<typeof requireAdmin>>;

/** Saves a status change from the deletion requests page; the page reloads its data after. */
export const changeDeletionRequestAction = async ({ request }: ActionFunctionArgs) => {
    const form = await request.formData();
    const status = String(form.get('status')) as Status;
    if (!STATUSES.includes(status)) return { error: 'Choose a status.' };

    const result = await changeDeletionRequest({
        id: String(form.get('id')),
        status,
        note: String(form.get('note') ?? '').trim() || undefined,
    });
    return result.ok ? { saved: String(form.get('id')) } : { error: result.error };
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
            {
                path: adminPaths.deletionRequests.slice(1),
                element: <DeletionRequests />,
                action: changeDeletionRequestAction,
            },
            {
                path: `${adminPaths.deletionRequests.slice(1)}/:requestId`,
                element: <DeletionRequest />,
                action: changeDeletionRequestAction,
            },
            { path: '*', element: <AdminNotFound /> },
        ],
    },
];
