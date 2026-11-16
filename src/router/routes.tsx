import type { RouteObject } from 'react-router-dom';

import { About, Contact, Home, NotFound, Projects, Services } from '../components/pages';
import { RootLayout } from '../components/templates';

/**
 * Every page. Keep docs/screen-map/screens.js in step: its test fails when a
 * path here has no screen on the map.
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
            { path: 'contact', element: <Contact /> },
            { path: '*', element: <NotFound /> },
        ],
    },
];
