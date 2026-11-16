import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import '../src/index.css';

const preview: Preview = {
    parameters: {
        layout: 'padded',
        controls: { matchers: { color: /(background|color)$/i } },
        backgrounds: {
            options: {
                light: { name: 'Light', value: '#ffffff' },
                dark: { name: 'Dark', value: '#121212' },
            },
        },
        a11y: { test: 'todo' },
    },
    initialGlobals: { backgrounds: { value: 'light' } },
    decorators: [
        // Links need a router. Screens bring their own (the real routes), so they opt out
        // with `parameters: { router: false }`.
        (Story, { parameters }) =>
            parameters.router === false ? (
                <Story />
            ) : (
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            ),
    ],
};

export default preview;
