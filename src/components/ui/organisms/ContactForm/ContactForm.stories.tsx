import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ContactForm } from './ContactForm.tsx';

/**
 * The enquiry form on Home and Contact. In Storybook there is no Netlify
 * function, so sending ends in the error state.
 */
const meta = {
    title: 'Organisms/ContactForm',
    component: ContactForm,
    decorators: [
        (Story) => (
            <div className='max-w-3xl'>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ContactForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** Submitted with nothing filled in: every required field says what it needs. */
export const Invalid: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Send message' }));
        await expect(await canvas.findByText('Please select a project type')).toBeVisible();
    },
};
