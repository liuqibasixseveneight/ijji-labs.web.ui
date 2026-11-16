/**
 * Every address on the site, in one place. Links, the menu, the footer, content and tests
 * all build their URLs from here, so a path can't drift out of step with the routes.
 *
 * An app's policy URLs are pasted into App Store Connect and the Play Console: they must
 * never change. `src/router/__tests__/storeUrls.test.tsx` pins them.
 */
export const paths = {
    home: '/',
    about: '/about',
    services: '/services',
    projects: '/projects',
    apps: '/apps',
    contact: '/contact',
    privacy: '/privacy',
    app: (slug: string) => ({
        root: `/apps/${slug}`,
        privacy: `/apps/${slug}/privacy`,
        terms: `/apps/${slug}/terms`,
        support: `/apps/${slug}/support`,
        deleteAccount: `/apps/${slug}/delete-account`,
    }),
} as const;

/** Contact, with the form's topic chosen in advance (e.g. `support`). */
export const contactAbout = (topic: string) =>
    `${paths.contact}?topic=${encodeURIComponent(topic)}`;
