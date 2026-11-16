import type { RouteObject } from 'react-router-dom';

import {
    About,
    AppDetail,
    AppPolicy,
    Apps,
    Contact,
    Home,
    NotFound,
    Privacy,
    Projects,
    Services,
} from '../components/pages';
import { RootLayout } from '../components/templates';

/**
 * Every page. Paths are built from `paths.ts`. Keep docs/screen-map/screens.js in step:
 * its test fails when a path here has no screen on the map.
 *
 * App pages are data-driven (`apps/:appSlug`): an app in src/content/apps.ts gets them all,
 * and an unknown slug shows Page not found.
 */
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'about', element: <About /> },
            { path: 'services', element: <Services /> },
            { path: 'projects', element: <Projects /> },
            { path: 'apps', element: <Apps /> },
            { path: 'apps/:appSlug', element: <AppDetail /> },
            { path: 'apps/:appSlug/privacy', element: <AppPolicy kind='privacy' /> },
            { path: 'apps/:appSlug/terms', element: <AppPolicy kind='terms' /> },
            { path: 'apps/:appSlug/support', element: <AppPolicy kind='support' /> },
            { path: 'apps/:appSlug/delete-account', element: <AppPolicy kind='deletion' /> },
            { path: 'contact', element: <Contact /> },
            { path: 'privacy', element: <Privacy /> },
            { path: '*', element: <NotFound /> },
        ],
    },
];
