import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from '../router/routes.tsx';

/** Renders the whole site (layout, navbar, footer and the page) at `path`, with the real routes. */
export const renderApp = (path = '/') => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const user = userEvent.setup();

    return { user, router, ...render(<RouterProvider router={router} />) };
};
