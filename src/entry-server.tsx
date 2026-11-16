import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';

import { apps, websitePrivacy } from './content';
export { llmsFullTxt, llmsTxt } from './content/llms.ts';
import { site } from './content/site.ts';
import { paths } from './router/paths.ts';
import { routes } from './router/routes.tsx';

/**
 * Every page to pre-render at build time, so each address serves real HTML: store
 * reviewers, crawlers and anyone without JavaScript see the page, not an empty shell.
 */
export const prerenderPaths = (): string[] => [
    paths.home,
    paths.about,
    paths.services,
    paths.projects,
    paths.apps,
    paths.contact,
    paths.privacy,
    ...apps.flatMap((app) => Object.values(paths.app(app.slug))),
];

/**
 * The sitemap: every page, with the date it last changed where we know it (a policy's
 * effective date). Search engines use lastmod to decide what to re-read.
 */
export const sitemapEntries = (): { path: string; lastmod?: string }[] => {
    const dated = new Map<string, string>([[paths.privacy, websitePrivacy.effectiveDate]]);
    for (const app of apps) {
        const to = paths.app(app.slug);
        dated.set(to.privacy, app.policies.privacy.effectiveDate);
        dated.set(to.terms, app.policies.terms.effectiveDate);
        dated.set(to.support, app.policies.support.effectiveDate);
        dated.set(to.deleteAccount, app.policies.deletion.effectiveDate);
    }
    return prerenderPaths().map((path) => ({ path, lastmod: dated.get(path) }));
};

/** Renders one path to HTML with the real routes. */
export const render = async (path: string): Promise<string> => {
    const handler = createStaticHandler(routes);
    const context = await handler.query(new Request(`${site.url}${path}`));

    if (context instanceof Response) throw new Error(`${path} redirected`);

    const router = createStaticRouter(handler.dataRoutes, context);

    return renderToString(
        <StrictMode>
            <StaticRouterProvider router={router} context={context} hydrate={false} />
        </StrictMode>,
    );
};
