import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { DeletionRequestForm } from './DeletionRequestForm.tsx';

/**
 * Asks us to delete an app account. In Storybook there is no Netlify function, so sending
 * ends in the error state.
 */
const meta = {
    title: 'Organisms/DeletionRequestForm',
    component: DeletionRequestForm,
    args: { app: { slug: 'ijji-tracker', name: 'IJJI Tracker' } },
    decorators: [
        (Story) => (
            <div className='max-w-2xl'>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof DeletionRequestForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** Sent without an email or the confirmation. */
export const Invalid: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Request deletion' }));
        await expect(
            await canvas.findByText('Please confirm you want the account deleted'),
        ).toBeVisible();
    },
};

/** Filled in and sent: here, with no function to receive it, it fails and keeps the email. */
export const SendFails: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(
            canvas.getByLabelText(/email address on your account/i),
            'me@example.com',
        );
        await userEvent.click(canvas.getByRole('checkbox'));
        await userEvent.click(canvas.getByRole('button', { name: 'Request deletion' }));
        await expect(await canvas.findByText('We couldn’t send your request')).toBeVisible();
    },
};
