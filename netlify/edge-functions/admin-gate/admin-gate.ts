// Runs on Netlify's edge (Deno) before /admin is served. Only the signed-in admin gets the
// dashboard's page; anyone else gets the site's ordinary 404, with a 404 status, so /admin
// looks like any address that isn't a page. The sign-in page is the one exception.
//
// This is the outer layer only. Every admin function checks the session again (withAdmin),
// including the "sign out everywhere" epoch, which lives in Blobs and isn't read here.

import { parseAllowlist, readCookie, verifySession } from '../../shared/admin/session.ts';

declare const Netlify: { env: { get(name: string): string | undefined } };

type Env = (name: string) => string | undefined;

const notFound = async (request: Request) => {
    const page = await fetch(new URL('/404.html', request.url)).catch(() => null);
    return new Response(page?.ok ? page.body : 'Page not found', {
        status: 404,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
    });
};

/** The gate, with the environment passed in so it can be tested outside Deno. */
export const gate = async (request: Request, env: Env): Promise<Response | undefined> => {
    const session = await verifySession(readCookie(request.headers.get('cookie')), {
        secret: env('ADMIN_SESSION_SECRET') ?? '',
        allowlist: parseAllowlist(env('ADMIN_USER_IDS')),
    });

    // Returning nothing lets Netlify carry on and serve the page.
    return session ? undefined : notFound(request);
};

export default (request: Request) => gate(request, (name) => Netlify.env.get(name));

export const config = {
    path: ['/admin', '/admin/*'],
    excludedPath: ['/admin/sign-in'],
};
