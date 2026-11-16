export type SubmitResult = { success: true } | { success: false; error: string };

const FAILED = 'Failed to send — please try again.';

/**
 * Posts a form to one of the site's Netlify functions, e.g. `contact`. Never throws: a
 * failure comes back as `{ success: false, error }` with a message fit to show.
 */
export const postForm = async (fn: string, data: object): Promise<SubmitResult> => {
    try {
        const response = await fetch(`/.netlify/functions/${fn}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            return { success: false, error: result.error ?? 'Something went wrong.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: FAILED };
    }
};
