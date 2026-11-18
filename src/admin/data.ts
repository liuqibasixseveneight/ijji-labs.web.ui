import { getSupabase, getWebsite } from './api.ts';
import { cached, prefetch } from './cache.ts';
import { adminPaths } from './paths.ts';
import type { Environment } from './supabase.ts';

// The data each page loads, through the cache: a loader hands its page the data at once if
// it's fresh, or a promise (and the last data) if not, so the page never waits to appear.

export const websiteData = () => cached('website', getWebsite);
export const supabaseData = (env: Environment) => cached(`supabase:${env}`, () => getSupabase(env));

/** The Overview's cards: the website, and the production Supabase project. */
export const overviewData = () => ({ website: websiteData(), supabase: supabaseData('prod') });
export type OverviewData = ReturnType<typeof overviewData>;

/** Starts loading a page's data when its link is hovered or focused, so the click is instant. */
export const prefetchPage = (to: string) => {
    const [path, search = ''] = to.split('?');
    if (path === adminPaths.overview || path === adminPaths.website)
        prefetch('website', getWebsite);
    if (path === adminPaths.overview) prefetch('supabase:prod', () => getSupabase('prod'));
    if (path === adminPaths.supabase) {
        const env: Environment = new URLSearchParams(search).get('env') === 'dev' ? 'dev' : 'prod';
        prefetch(`supabase:${env}`, () => getSupabase(env));
    }
};

/** Props for a link that prefetches its page on hover, focus or touch. */
export const prefetchOn = (to: string) => ({
    onMouseEnter: () => prefetchPage(to),
    onFocus: () => prefetchPage(to),
    onTouchStart: () => prefetchPage(to),
});
