import { createBrowserRouter } from 'react-router-dom';

import { About, Contact, Home, Projects, Services } from '../components/pages';
import { RootLayout } from '../components/templates';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: '/about',
                element: <About />,
            },
            {
                path: '/services',
                element: <Services />,
            },
            {
                path: '/projects',
                element: <Projects />,
            },
            {
                path: '/contact',
                element: <Contact />,
            },
        ],
    },
]);
