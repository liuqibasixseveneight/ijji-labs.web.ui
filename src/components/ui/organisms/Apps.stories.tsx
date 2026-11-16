import type { Meta, StoryObj } from '@storybook/react-vite';

import { apps } from '../../../content';
import { AppMark } from '../atoms';
import { PlatformBadges, PolicyLinks } from '../molecules';
import { AppCard } from './AppCard';
import { FeatureGrid } from './FeatureGrid';

const tracker = apps[0];

/** The pieces of our apps' pages: cards, features, store badges and policy links. */
const meta = {
    title: 'Apps',
    globals: { backgrounds: { value: 'dark' } },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** An app on Home and /apps. */
export const Card: Story = { render: () => <AppCard app={tracker} /> };

/** The app's mark: its own icon, in the app-icon shape. */
export const Mark: Story = {
    render: () => (
        <div className='flex items-end gap-6'>
            <AppMark slug={tracker.slug} />
            <AppMark slug={tracker.slug} size='lg' />
        </div>
    ),
};

/** Before launch, on a dark band. */
export const BadgesComingSoon: Story = {
    render: () => <PlatformBadges platforms={tracker.platforms} />,
};

/** Once live: links to each store. */
export const BadgesLive: Story = {
    render: () => (
        <PlatformBadges
            platforms={{
                ios: { url: 'https://apps.apple.com/' },
                android: { url: 'https://play.google.com/' },
            }}
        />
    ),
};

/** On a white band. */
export const BadgesOnLight: Story = {
    globals: { backgrounds: { value: 'light' } },
    render: () => <PlatformBadges platforms={tracker.platforms} tone='light' />,
};

/** What it does, on the app's page. */
export const Features: Story = {
    globals: { backgrounds: { value: 'light' } },
    render: () => <FeatureGrid features={tracker.features} />,
};

/** The app's four policy pages. */
export const Policies: Story = { render: () => <PolicyLinks app={tracker} /> };
