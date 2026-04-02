import type { ContactFormData, SubmitResult } from './types.ts';

export const submitForm = async (data: ContactFormData): Promise<SubmitResult> => {
    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error ?? 'Something went wrong.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            success: false,
            error: 'Failed to send — please try again.',
        };
    }
};
