import type { Meta, StoryObj } from '@storybook/react-vite';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { paths } from '../../router/paths.ts';
import { routes } from '../../router/routes.tsx';

/**
 * Every page as a visitor sees it: the real routes, layout, navbar and footer.
 * Links work, so you can click through the site from here. The screen map
 * (docs/screen-map) describes how they connect.
 */
const Screen = ({ path }: { path: string }) => (
    <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
);

const meta = {
    title: 'Screens',
    component: Screen,
    parameters: { layout: 'fullscreen', router: false },
} satisfies Meta<typeof Screen>;

export default meta;

type Story = StoryObj<typeof meta>;

/** `/`: the gradient hero with the palette picker, then about, services, apps, work and the form. */
export const Home: Story = { args: { path: '/' } };

export const About: Story = { args: { path: '/about' } };

export const Services: Story = { args: { path: '/services' } };

export const Projects: Story = { args: { path: '/projects' } };

export const Apps: Story = { args: { path: paths.apps } };

/** One of our apps: what it does, where to get it, and its policies. */
export const IjjiTracker: Story = { args: { path: paths.app('ijji-tracker').root } };

/** The App Store and Play Console link here. */
export const IjjiTrackerPrivacy: Story = { args: { path: paths.app('ijji-tracker').privacy } };

export const IjjiTrackerTerms: Story = { args: { path: paths.app('ijji-tracker').terms } };

/** Apple's support URL. */
export const IjjiTrackerSupport: Story = { args: { path: paths.app('ijji-tracker').support } };

/** Google Play's account-deletion URL, with the request form. */
export const IjjiTrackerDeleteAccount: Story = {
    args: { path: paths.app('ijji-tracker').deleteAccount },
};

export const Contact: Story = { args: { path: paths.contact } };

/** With the topic chosen from the address, as the support page links it. */
export const ContactForSupport: Story = { args: { path: '/contact?topic=support' } };

export const WebsitePrivacy: Story = { args: { path: paths.privacy } };

/** Any address that isn't a page. */
export const NotFound: Story = { args: { path: '/no-such-page' } };
