import type { Context } from '@netlify/functions';

import { adminEnv, type AdminEnv } from './env.ts';
import { readCookie, verifySession, type Session } from './session.ts';
import { getEpoch } from './state.ts';

/** Admin responses are never cached, by the browser or anything in between. */
const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };

export const json = (status: number, body: object, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...NO_STORE, ...headers },
    });

/** Refusals say as little as possible. */
export const refuse = (status: 401 | 403 | 405 | 500) =>
    json(status, { error: status === 401 ? 'Not signed in.' : 'Not allowed.' });

/**
 * Same-site requests from our own pages only: the Origin is this site (a browser always
 * sends it on POST and DELETE), and the request carries `X-Admin-Request`, which a form on
 * another site can't add. On top of the cookie's SameSite=Strict, against cross-site requests.
 */
export const fromOurPages = (request: Request) => {
    if (request.headers.get('x-admin-request') !== '1') return false;
    const origin = request.headers.get('origin');
    if (origin === null) return request.method === 'GET' || request.method === 'HEAD';
    return origin === new URL(request.url).origin;
};

/** The signed-in admin's session, or null. Checks the cookie, the allowlist and the epoch. */
export const currentSession = async (request: Request, env: AdminEnv) => {
    const session = await verifySession(readCookie(request.headers.get('cookie')), {
        secret: env.secret,
        allowlist: env.allowlist,
    });
    if (!session) return null;
    return session.epoch === (await getEpoch()) ? session : null;
};

type AdminHandler = (
    request: Request,
    session: Session,
    env: AdminEnv,
    context?: Context,
) => Promise<Response>;

/**
 * Wraps every admin endpoint. In order: only the listed methods (405), only from our own
 * pages (403), only with a valid, unexpired, MFA session for an allowlisted user from the
 * current epoch (401). Anything else never reaches the handler.
 */
export const withAdmin =
    (handler: AdminHandler, { methods = ['GET'] }: { methods?: string[] } = {}) =>
    async (request: Request, context?: Context): Promise<Response> => {
        if (!methods.includes(request.method)) return refuse(405);
        if (!fromOurPages(request)) return refuse(403);

        const env = adminEnv();
        if (!env) return refuse(500);

        const session = await currentSession(request, env);
        if (!session) return refuse(401);

        return handler(request, session, env, context);
    };
