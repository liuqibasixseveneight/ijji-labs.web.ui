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
import { IjjiTracker } from './pages/IjjiTracker.tsx';
import { Supabase } from './pages/Supabase.tsx';
import { appData, overviewData, supabaseData, websiteData } from './data.ts';
import { environmentFrom } from './supabase.ts';
import { Website } from './pages/Website.tsx';

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

/**
 * The session and deletion requests load once, then again only after a change is saved or
 * on a refresh: not on every page change, or on every keystroke in a page's search (which
 * goes in the URL).
 */
export const shouldRevalidateAdmin: NonNullable<RouteObject['shouldRevalidate']> = ({
    currentUrl,
    nextUrl,
    formMethod,
    defaultShouldRevalidate,
}) =>
    formMethod !== undefined || currentUrl.href === nextUrl.href ? defaultShouldRevalidate : false;

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
        shouldRevalidate: shouldRevalidateAdmin,
        element: <AdminLayout />,
        children: [
            // These pages' loaders don't wait: they hand over cached data or a promise
            // (src/admin/data.ts), so the page appears at once with a skeleton or the last data.
            { index: true, element: <Overview />, loader: overviewData },
            { path: adminPaths.website.slice(1), element: <Website />, loader: websiteData },
            {
                // ?env=dev for the develop project; production otherwise.
                path: adminPaths.supabase.slice(1),
                element: <Supabase />,
                loader: ({ request }) => supabaseData(environmentFrom(new URL(request.url).search)),
            },
            { path: adminPaths.app.slice(1), element: <IjjiTracker />, loader: appData },
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
