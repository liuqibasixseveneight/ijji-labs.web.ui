import type { Config } from '@netlify/functions';

import { signInSchema } from '../../../src/admin/schema.ts';
import { sendToStudio } from '../../shared/email.ts';
import { adminEnv } from '../../shared/admin/env.ts';
import { currentSession, fromOurPages, json, refuse } from '../../shared/admin/http.ts';
import {
    clearedCookie,
    SESSION_SECONDS,
    sessionCookie,
    signSession,
} from '../../shared/admin/session.ts';
import { signIn } from '../../shared/admin/supabaseAuth.ts';
import { bumpEpoch, getEpoch, isLocked, recordFailure } from '../../shared/admin/state.ts';

export const config: Config = { path: '/api/admin/session' };

/** The same answer for every failed sign-in, so nobody learns which part was wrong. */
export const REFUSED = 'Those details didn’t work.';
export const LOCKED = 'Too many attempts. Sign-in is paused for a while; try again later.';

const lockedEmail = () =>
    sendToStudio({
        subject: 'Admin sign-in locked for an hour',
        html: '<p>There were too many failed sign-ins to the ijji labs admin dashboard, so sign-in is paused for an hour.</p><p>If that wasn’t you, change the admin account’s password in the production Supabase project, and check its authenticator.</p>',
        replyTo: process.env.CONTACT_EMAIL_TO!,
    }).catch((error) => console.error('Lockout email failed:', error));

/**
 * /api/admin/session
 * - POST signs in: email, password and authenticator code, checked with Supabase on the
 *   server, then an httpOnly session cookie of our own. Nothing from Supabase is kept.
 * - DELETE signs out (`?everywhere=1` ends every session).
 */
export default async (request: Request): Promise<Response> => {
    if (request.method !== 'POST' && request.method !== 'DELETE') return refuse(405);
    if (!fromOurPages(request)) return refuse(403);

    if (request.method === 'DELETE') return signOut(request);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json(400, { error: 'Invalid request.' });
    }

    const form = signInSchema.safeParse(body);
    if (!form.success) return json(400, { error: 'Some details are missing or invalid.' });
    if (form.data.website) return json(401, { error: REFUSED });

    const env = adminEnv();
    if (!env) return refuse(500);

    if (await isLocked()) return json(429, { error: LOCKED });

    const result = await signIn(env, form.data);

    if (result.ok === false) {
        if (await recordFailure()) await lockedEmail();
        return json(401, { error: REFUSED });
    }

    if (result.ok === 'enrol') {
        const { factorId, qrCode, secret } = result;
        return json(200, { enrol: { factorId, qrCode, secret } });
    }

    const now = Math.floor(Date.now() / 1000);
    const cookie = await signSession(
        {
            v: 1,
            sub: result.userId,
            aal: 'aal2',
            iat: now,
            exp: now + SESSION_SECONDS,
            epoch: await getEpoch(),
        },
        env.secret,
    );

    return json(200, { success: true }, { 'Set-Cookie': sessionCookie(cookie) });
};

const signOut = async (request: Request) => {
    if (new URL(request.url).searchParams.get('everywhere') === '1') {
        const env = adminEnv();
        if (!env) return refuse(500);
        if (!(await currentSession(request, env))) return refuse(401);
        await bumpEpoch();
    }

    return json(200, { success: true }, { 'Set-Cookie': clearedCookie() });
};
