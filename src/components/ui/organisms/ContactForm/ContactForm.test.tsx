import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactForm } from './ContactForm.tsx';
import { submitForm } from './submitForm.ts';

vi.mock('./submitForm.ts', () => ({ submitForm: vi.fn() }));

const renderForm = (path = '/contact') => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={[path]}>
            <ContactForm />
        </MemoryRouter>,
    );
    return user;
};

const fillRequired = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/your name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/contact number/i), '+44 113 496 0000');
    await user.selectOptions(screen.getByLabelText(/what’s it about/i), 'Website redesign');
    await user.type(screen.getByLabelText(/^message/i), 'We need a new site by spring.');
};

describe('ContactForm', () => {
    beforeEach(() => {
        vi.mocked(submitForm).mockReset();
    });

    it('labels every field', () => {
        renderForm();

        for (const label of [
            /your name/i,
            /company name/i,
            /email address/i,
            /contact number/i,
            /what’s it about/i,
            /preferred contact method/i,
            /^message/i,
            /how did you hear about us/i,
        ]) {
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        }
    });

    it('says what is missing, and sends nothing, when submitted empty', async () => {
        const user = renderForm();

        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByText('Name must be at least 2 characters')).toBeVisible();
        expect(screen.getByText('Please enter a valid email address')).toBeVisible();
        expect(screen.getByText('Contact number is required')).toBeVisible();
        expect(screen.getByText('Please choose what it’s about')).toBeVisible();
        expect(screen.getByText('Message must be at least 10 characters')).toBeVisible();
        expect(submitForm).not.toHaveBeenCalled();
    });

    it('rejects a phone number that is not one', async () => {
        const user = renderForm();

        await fillRequired(user);
        await user.clear(screen.getByLabelText(/contact number/i));
        await user.type(screen.getByLabelText(/contact number/i), 'call me');
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByText('Please enter a valid phone number')).toBeVisible();
        expect(submitForm).not.toHaveBeenCalled();
    });

    it('sends a filled-in form, thanks them, and can start again', async () => {
        vi.mocked(submitForm).mockResolvedValue({ success: true });
        const user = renderForm();

        await fillRequired(user);
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByRole('heading', { name: 'Message sent!' })).toBeVisible();
        expect(submitForm).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Smith',
                email: 'jane@example.com',
                projectType: 'Website redesign',
            }),
        );

        await user.click(screen.getByRole('button', { name: 'Send another message' }));

        expect(screen.getByLabelText(/your name/i)).toHaveValue('');
    });

    it('keeps what they typed and shows why, when sending fails', async () => {
        vi.mocked(submitForm).mockResolvedValue({
            success: false,
            error: 'Failed to send — please try again.',
        });
        const user = renderForm();

        await fillRequired(user);
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByText('Failed to send message')).toBeVisible();
        expect(screen.getByText('Failed to send — please try again.')).toBeVisible();
        expect(screen.getByLabelText(/your name/i)).toHaveValue('Jane Smith');
    });

    it('chooses the topic from the address, e.g. ?topic=support', async () => {
        renderForm('/contact?topic=support');

        expect(await screen.findByDisplayValue('Help with IJJI Tracker')).toBeInTheDocument();
    });

    it('ignores a topic it doesn’t know', () => {
        renderForm('/contact?topic=<script>');

        expect(screen.getByLabelText(/what’s it about/i)).toHaveValue('');
    });

    it('needs no phone number for a support request', async () => {
        vi.mocked(submitForm).mockResolvedValue({ success: true });
        const user = renderForm('/contact?topic=support');

        await screen.findByDisplayValue('Help with IJJI Tracker');
        await user.type(screen.getByLabelText(/your name/i), 'Jane Smith');
        await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/^message/i), 'My reminders stopped arriving.');
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByRole('heading', { name: 'Message sent!' })).toBeVisible();
        expect(submitForm).toHaveBeenCalledWith(
            expect.objectContaining({ projectType: 'Help with IJJI Tracker', phone: '' }),
        );
    });

    it('promises the reply time from site.ts', async () => {
        vi.mocked(submitForm).mockResolvedValue({ success: true });
        const user = renderForm();

        await fillRequired(user);
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        expect(await screen.findByText(/within one business day/)).toBeVisible();
    });
});
