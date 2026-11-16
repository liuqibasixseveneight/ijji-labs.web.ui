import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitForm } from './submitForm.ts';
import type { ContactFormData } from './types.ts';

const data: ContactFormData = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+44 113 496 0000',
    projectType: 'New website project',
    message: 'A landing page for our launch.',
};

const respond = (status: number, body: unknown) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('submitForm', () => {
    afterEach(() => vi.restoreAllMocks());

    it('posts the form as JSON to the contact function', async () => {
        const fetch = respond(200, { success: true });

        await expect(submitForm(data)).resolves.toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith('/.netlify/functions/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    });

    it('passes on the error the function gives', async () => {
        respond(400, { success: false, error: 'Some details are missing' });

        await expect(submitForm(data)).resolves.toEqual({
            success: false,
            error: 'Some details are missing',
        });
    });

    it('falls back to a general error when the function gives none', async () => {
        respond(500, {});

        await expect(submitForm(data)).resolves.toEqual({
            success: false,
            error: 'Something went wrong.',
        });
    });

    it('says to try again when the network fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(submitForm(data)).resolves.toEqual({
            success: false,
            error: 'Failed to send — please try again.',
        });
    });
});
