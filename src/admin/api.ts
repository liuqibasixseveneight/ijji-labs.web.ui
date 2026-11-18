import type { DeletionRequest, Status } from './deletionRequests.ts';
import type { SignInData } from './schema.ts';
import { clearCache } from './cache.ts';
import { PARTS, type Environment, type Supabase } from './supabase.ts';
import type { Website } from './website.ts';

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
    // Nothing loaded stays in memory after signing out.
    clearCache();
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

export type DeletionRequests = {
    requests: DeletionRequest[];
    now: number;
    /** The production Supabase project's SQL editor, where accounts are deleted. */
    sqlEditorUrl: string;
};

/** Every web deletion request, open ones first; null if they couldn't be loaded. */
export const getDeletionRequests = async (): Promise<DeletionRequests | null> => {
    try {
        const response = await request('deletion-requests');
        return response.ok ? ((await response.json()) as DeletionRequests) : null;
    } catch {
        return null;
    }
};

/** Moves a request on; an error message to show if it didn't work. */
export const changeDeletionRequest = async (change: {
    id: string;
    status: Status;
    note?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
        const response = await request('deletion-requests', {
            method: 'POST',
            body: JSON.stringify(change),
        });
        if (response.ok) return { ok: true };
        const body = await response.json().catch(() => ({}));
        return { ok: false, error: body.error ?? 'That didn’t save. Try again.' };
    } catch {
        return { ok: false, error: 'Couldn’t reach the server. Try again.' };
    }
};

export type LighthouseRun = { ok: true } | { ok: false; error: string; retryAt?: number };

/**
 * Runs Lighthouse on one page and strategy now (about 20 seconds); never throws. The new
 * scores come with the website's data, reloaded afterwards.
 */
export const runLighthouse = async (key: string): Promise<LighthouseRun> => {
    try {
        const response = await request('lighthouse', {
            method: 'POST',
            body: JSON.stringify({ key }),
        });
        if (response.ok) return { ok: true };
        const body = await response.json().catch(() => ({}));
        return {
            ok: false,
            error: body.error ?? 'That run didn’t work. Try again.',
            ...(typeof body.retryAt === 'number' && { retryAt: body.retryAt }),
        };
    } catch {
        return { ok: false, error: 'Couldn’t reach the server. Try again.' };
    }
};

/** One Supabase project's data (counts, health, advisors, traffic); null if it couldn't load. */
export const getSupabase = async (env: Environment): Promise<Supabase | null> => {
    try {
        const response = await request(`supabase?env=${env}`);
        if (!response.ok) return null;
        const body = await response.json();
        return body && PARTS.every((part) => body[part] && 'data' in body[part])
            ? (body as Supabase)
            : null;
    } catch {
        return null;
    }
};

/** The website section's data (uptime, Lighthouse, deploys, forms); null if it couldn't load. */
export const getWebsite = async (): Promise<Website | null> => {
    try {
        const response = await request('website');
        if (!response.ok) return null;
        const body = await response.json();
        // Only what looks like the website's data: anything else counts as "couldn't load".
        const parts = ['uptime', 'lighthouse', 'deploys', 'forms'] as const;
        return body && parts.every((part) => body[part] && 'data' in body[part])
            ? (body as Website)
            : null;
    } catch {
        return null;
    }
};
