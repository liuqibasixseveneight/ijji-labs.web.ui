import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './Button.tsx';

const meta = {
    title: 'Atoms/Button',
    component: Button,
    args: { label: 'Send message', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The one call to action, with its cut corner. */
export const Default: Story = {};

/** While the contact form sends: disabled, with a spinner. */
export const Loading: Story = { args: { isLoading: true } };

export const Disabled: Story = { args: { disabled: true } };

/** A router link that looks the same, as in the navbar's Get in touch. */
export const InternalLink: Story = {
    args: { type: 'internal-link', to: '/contact', label: 'Get in touch' },
};

/** A deeper cut. */
export const LargeCut: Story = { args: { cutSize: 24 } };
