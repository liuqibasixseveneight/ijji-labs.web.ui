import type { SignInData } from './schema.ts';

// The dashboard talks only to this site's own /api/admin/* functions, which hold every key.
// Nothing here knows a secret; the session is an httpOnly cookie the browser sends itself.

const HEADERS = { 'X-Admin-Request': '1', 'Content-Type': 'application/json' };

export type Enrolment = { factorId: string; qrCode: string; secret: string };

export type SignInResult =
    | { status: 'signed-in' }
    | { status: 'enrol'; enrol: Enrolment }
    | { status: 'error'; error: string };

const request = (path: string, init: RequestInit = {}) =>
    fetch(`/api/admin/${path}`, {
        ...init,
        credentials: 'same-origin',
        headers: HEADERS,
    });

/** Signs in; never throws. */
export const signIn = async (data: SignInData): Promise<SignInResult> => {
    try {
        const response = await request('session', { method: 'POST', body: JSON.stringify(data) });
        const body = await response.json().catch(() => ({}));

        if (response.ok && body.enrol) return { status: 'enrol', enrol: body.enrol };
        if (response.ok) return { status: 'signed-in' };
        return { status: 'error', error: body.error ?? 'Something went wrong.' };
    } catch {
        return { status: 'error', error: 'Couldn’t reach the server. Try again.' };
    }
};

/** Signs out here, or on every device with `everywhere`. */
export const signOut = async ({ everywhere = false } = {}) => {
    await request(`session${everywhere ? '?everywhere=1' : ''}`, { method: 'DELETE' }).catch(
        () => undefined,
    );
};

export type Me = { signedIn: true; expiresAt: number };

/** Who's signed in, or null when nobody is (or the session has ended). */
export const getMe = async (): Promise<Me | null> => {
    try {
        const response = await request('me');
        return response.ok ? ((await response.json()) as Me) : null;
    } catch {
        return null;
    }
};
