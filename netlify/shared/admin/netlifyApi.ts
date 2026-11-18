// Netlify's API, read-only, from the admin functions. The token (NETLIFY_API_TOKEN) can do
// anything on the account, so this only ever GETs this site's deploys, and passes on only
// the fields the dashboard shows.

export type Deploy = {
    id: string;
    state: string;
    context: string;
    branch: string | null;
    title: string | null;
    commitRef: string | null;
    createdAt: string;
    publishedAt: string | null;
    /** Build time in seconds. */
    deployTime: number | null;
    errorMessage: string | null;
    /** The deploy's page in the Netlify app. */
    adminUrl: string;
};

type ApiDeploy = {
    id: string;
    state: string;
    context: string;
    branch?: string | null;
    title?: string | null;
    commit_ref?: string | null;
    created_at: string;
    published_at?: string | null;
    deploy_time?: number | null;
    error_message?: string | null;
    admin_url?: string;
    site_id?: string;
};

/** This site's last `count` deploys, newest first. Throws if Netlify refuses. */
export const listDeploys = async (token: string, siteId: string, count = 20): Promise<Deploy[]> => {
    if (!/^[\w-]+$/.test(siteId)) throw new Error('Not a site id');

    const response = await fetch(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=${count}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'ijji-labs-admin' },
            signal: AbortSignal.timeout(10_000),
        },
    );
    if (!response.ok) throw new Error(`Netlify answered ${response.status}`);

    const deploys = (await response.json()) as ApiDeploy[];
    return deploys.map((d) => ({
        id: d.id,
        state: d.state,
        context: d.context,
        branch: d.branch ?? null,
        title: d.title ?? null,
        commitRef: d.commit_ref ?? null,
        createdAt: d.created_at,
        publishedAt: d.published_at ?? null,
        deployTime: d.deploy_time ?? null,
        errorMessage: d.error_message ?? null,
        // admin_url is the site's page in the Netlify app; the deploy is under it.
        adminUrl: `${d.admin_url ?? `https://app.netlify.com/sites/${siteId}`}/deploys/${d.id}`,
    }));
};
