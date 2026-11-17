// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { prerenderPaths, render, sitemapEntries } from '../entry-server.tsx';

/**
 * What the build writes for each page, rendered on the server: no browser, no JavaScript.
 * This is what store reviewers and crawlers see.
 */
describe('pre-rendering', () => {
    it('covers every page, including every app policy', () => {
        expect(prerenderPaths()).toEqual(
            expect.arrayContaining([
                '/',
                '/apps',
                '/apps/ijji-tracker',
                '/apps/ijji-tracker/privacy',
                '/apps/ijji-tracker/terms',
                '/apps/ijji-tracker/support',
                '/apps/ijji-tracker/delete-account',
                '/privacy',
            ]),
        );
    });

    it('renders the privacy policy as real HTML, with its title and canonical link', async () => {
        const html = await render('/apps/ijji-tracker/privacy');

        expect(html).toContain('<title>Privacy policy · IJJI Tracker · ijji labs</title>');
        expect(html).toContain('href="https://www.ijji-labs.com/apps/ijji-tracker/privacy"');
        expect(html).toContain('Who helps us run the app');
        expect(html).toContain('support@ijji-labs.com');
    });

    it('writes each link and button label once: the rolling copies are added in the browser', async () => {
        const html = await render('/');
        const text = html
            .replace(/<script[\s\S]*?<\/script>/g, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

        expect(html).toContain('Get in touch');
        expect(html).not.toContain('aria-hidden="true" class="inline-block');
        for (const label of ['Get in touch', 'All services', 'About', 'More about us']) {
            expect(text).not.toContain(`${label} ${label}`);
        }
    });

    it('renders the deletion form, so it is there before JavaScript loads', async () => {
        const html = await render('/apps/ijji-tracker/delete-account');

        expect(html).toContain('Request deletion');
    });

    it.each(prerenderPaths())('%s renders, with a title', async (path) => {
        expect(await render(path)).toMatch(/<title>[^<]+<\/title>/);
    });

    it('dates every policy in the sitemap, and only real dates', () => {
        const entries = sitemapEntries();

        expect(entries.map((entry) => entry.path)).toEqual(prerenderPaths());
        for (const entry of entries.filter((e) =>
            /privacy|terms|support|delete-account/.test(e.path),
        )) {
            expect(entry.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
    });

    it('preloads nothing it shouldn’t: no three.js in a policy page', async () => {
        expect(await render('/apps/ijji-tracker/privacy')).not.toContain('three');
    });

    it('renders Page not found for 404.html', async () => {
        expect(await render('/404')).toContain('Page not found');
    });
});
