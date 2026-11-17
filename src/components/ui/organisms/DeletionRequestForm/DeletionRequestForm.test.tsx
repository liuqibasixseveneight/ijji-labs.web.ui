import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postForm } from '../../../../lib/postForm.ts';
import { axeViolations } from '../../../../test/axe.ts';
import { DeletionRequestForm } from './DeletionRequestForm.tsx';

vi.mock('../../../../lib/postForm.ts', () => ({ postForm: vi.fn() }));

const app = { slug: 'ijji-tracker', name: 'IJJI Tracker' };

const renderForm = () => {
    const user = userEvent.setup();
    render(<DeletionRequestForm app={app} />);
    return user;
};

const submit = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('button', { name: 'Request deletion' }));

describe('DeletionRequestForm', () => {
    beforeEach(() => vi.mocked(postForm).mockReset());

    it('asks for the email and a confirmation, and sends nothing without them', async () => {
        const user = renderForm();

        await submit(user);

        expect(
            await screen.findByText('Please enter the email address on your account'),
        ).toBeVisible();
        expect(screen.getByText('Please confirm you want the account deleted')).toBeVisible();
        expect(postForm).not.toHaveBeenCalled();
    });

    it('marks the missing answers for screen readers, and passes axe with its errors showing', async () => {
        const user = renderForm();

        await submit(user);
        await screen.findByText('Please confirm you want the account deleted');

        const confirm = screen.getByRole('checkbox');
        expect(confirm).toHaveAttribute('aria-invalid', 'true');
        expect(confirm).toHaveAccessibleDescription('Please confirm you want the account deleted');
        expect(await axeViolations(confirm.closest('form')!)).toEqual([]);
    });

    it('sends the request for this app, then says what happens next', async () => {
        vi.mocked(postForm).mockResolvedValue({ success: true });
        const user = renderForm();

        await user.type(screen.getByLabelText(/email address on your account/i), 'me@example.com');
        await user.type(screen.getByLabelText(/anything you’d like to tell us/i), 'Switching apps');
        await user.click(screen.getByRole('checkbox'));
        await submit(user);

        expect(await screen.findByRole('heading', { name: 'Request received' })).toBeVisible();
        expect(screen.getByText(/We'll email you from support@ijji-labs.com/)).toBeVisible();
        expect(postForm).toHaveBeenCalledWith('account-deletion', {
            app: 'ijji-tracker',
            email: 'me@example.com',
            reason: 'Switching apps',
            confirm: true,
            website: '',
        });
    });

    it('keeps what they typed and says why, when sending fails', async () => {
        vi.mocked(postForm).mockResolvedValue({
            success: false,
            error: 'Failed to send — please try again.',
        });
        const user = renderForm();

        await user.type(screen.getByLabelText(/email address on your account/i), 'me@example.com');
        await user.click(screen.getByRole('checkbox'));
        await submit(user);

        expect(await screen.findByText('We couldn’t send your request')).toBeVisible();
        expect(screen.getByLabelText(/email address on your account/i)).toHaveValue(
            'me@example.com',
        );
    });
});
