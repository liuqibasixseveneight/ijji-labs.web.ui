import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { apps, faqs } from '../../content';
import { llmsFullTxt, llmsTxt } from '../../content/llms.ts';
import { webManifest } from '../../content/webManifest.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { paths } from '../paths.ts';

const tracker = paths.app('ijji-tracker');
const PAGES = [
    paths.home,
    paths.about,
    paths.services,
    paths.projects,
    paths.apps,
    tracker.root,
    tracker.privacy,
    tracker.terms,
    tracker.support,
    tracker.deleteAccount,
    paths.contact,
    paths.privacy,
];

type Node = Record<string, unknown>;

/** Every JSON-LD block on the rendered page, parsed. */
const jsonLd = (container: HTMLElement): Node[] =>
    [...container.querySelectorAll('script[type="application/ld+json"]')].map((script) =>
        JSON.parse(script.textContent!),
    );

/** Every node, including those inside a @graph. */
const nodes = (blocks: Node[]) => blocks.flatMap((block) => (block['@graph'] as Node[]) ?? [block]);
const ofType = (blocks: Node[], type: string) => nodes(blocks).filter((n) => n['@type'] === type);

describe('search and AI answer engines', () => {
    it.each(PAGES)(
        '%s: a title and description of a length search results show in full',
        (path) => {
            renderApp(path);
            const description = document
                .querySelector('meta[name="description"]')!
                .getAttribute('content')!;

            expect(document.title.length).toBeLessThanOrEqual(65);
            expect(description.length).toBeGreaterThanOrEqual(50);
            expect(description.length).toBeLessThanOrEqual(170);
        },
    );

    it.each(PAGES)('%s: describes the studio and the page as valid JSON-LD', (path) => {
        const { container } = renderApp(path);
        const blocks = jsonLd(container);

        expect(JSON.stringify(blocks)).not.toContain('undefined');
        for (const block of blocks) expect(block['@context']).toBe('https://schema.org');

        const [organization] = ofType(blocks, 'Organization');
        expect(organization).toMatchObject({
            name: 'ijji labs',
            url: 'https://www.ijji-labs.com',
            email: 'support@ijji-labs.com',
            address: expect.objectContaining({ addressLocality: 'Leeds', addressCountry: 'GB' }),
        });
        expect(ofType(blocks, 'WebSite')).toHaveLength(1);

        const pageNode = nodes(blocks).find((n) => String(n['@id']).endsWith('#webpage'));
        expect(pageNode?.url).toBe(`https://www.ijji-labs.com${path === '/' ? '' : path}`);
    });

    it('Services lists every service and answers every FAQ', () => {
        const { container } = renderApp(paths.services);
        const blocks = jsonLd(container);

        const [catalog] = ofType(blocks, 'OfferCatalog');
        expect((catalog.itemListElement as Node[]).length).toBe(3);
        const [faq] = ofType(blocks, 'FAQPage');
        expect((faq.mainEntity as Node[]).length).toBe(faqs.length);
    });

    it('the app page describes IJJI Tracker as a mobile app, linking its store policy URLs', () => {
        const { container } = renderApp(tracker.root);
        const [app] = ofType(jsonLd(container), 'MobileApplication');

        expect(app).toMatchObject({
            name: 'IJJI Tracker',
            operatingSystem: 'iOS, Android',
            contentRating: '16+',
            privacyPolicy: `https://www.ijji-labs.com${tracker.privacy}`,
            termsOfService: `https://www.ijji-labs.com${tracker.terms}`,
        });
        expect(app.downloadUrl).toBeUndefined();
    });

    it('the app’s icon is published at a fixed URL for its structured data', () => {
        const { container } = renderApp(tracker.root);
        const [app] = ofType(jsonLd(container), 'MobileApplication');

        expect(app.image).toBe('https://www.ijji-labs.com/apps/ijji-tracker/icon.png');
        expect(existsSync(resolve(process.cwd(), 'public/apps/ijji-tracker/icon.png'))).toBe(true);
    });

    it.each([tracker.privacy, tracker.terms, tracker.support, tracker.deleteAccount])(
        '%s: dated, and placed in a breadcrumb trail',
        (path) => {
            const { container } = renderApp(path);
            const blocks = jsonLd(container);

            const page = nodes(blocks).find((n) => String(n['@id']).endsWith('#webpage'))!;
            expect(page.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            const [trail] = ofType(blocks, 'BreadcrumbList');
            expect((trail.itemListElement as Node[]).map((item) => item.name)).toEqual([
                'Apps',
                'IJJI Tracker',
                expect.any(String),
            ]);
        },
    );

    it('the support page marks up its questions as an FAQ', () => {
        const { container } = renderApp(tracker.support);
        const [faq] = ofType(jsonLd(container), 'FAQPage');
        const questions = apps[0].policies.support.sections.flatMap((s) => s.faqs ?? []);

        expect((faq.mainEntity as Node[]).map((q) => q.name)).toEqual(
            questions.map((q) => q.question),
        );
    });

    it('escapes "<" so text can never close the script tag', () => {
        const { container } = renderApp(paths.services);

        for (const script of container.querySelectorAll('script[type="application/ld+json"]')) {
            expect(script.innerHTML).not.toMatch(/<\/?[a-z]/i);
        }
    });
});

describe('llms.txt', () => {
    it('links every page and every app policy, with absolute URLs', () => {
        const text = llmsTxt();

        expect(text.startsWith('# ijji labs\n')).toBe(true);
        for (const path of [
            paths.about,
            paths.services,
            paths.projects,
            paths.apps,
            paths.contact,
            paths.privacy,
        ]) {
            expect(text).toContain(`(https://www.ijji-labs.com${path})`);
        }
        for (const url of Object.values(tracker)) {
            expect(text).toContain(`(https://www.ijji-labs.com${url})`);
        }
        expect(text).toContain('support@ijji-labs.com');
    });

    it('says plainly that client work is websites, so assistants don’t assume app work', () => {
        const text = llmsTxt();

        expect(text).toContain("We don't take on app projects for clients");
        expect(text).toContain('Help with an app: https://www.ijji-labs.com/contact?topic=support');
        expect(text).not.toMatch(/\.\)\./);
    });

    it('llms-full.txt carries the full text of every policy section', () => {
        const text = llmsFullTxt();
        const app = apps[0];

        for (const doc of Object.values(app.policies)) {
            for (const section of doc.sections) expect(text).toContain(section.heading);
        }
        expect(text).not.toContain('[object Object]');
        expect(text).not.toContain('undefined');
    });
});

describe('the studio mark as the site icon', () => {
    const publicFile = (file: string) => resolve(process.cwd(), 'public', file);

    it('index.html links the favicon, the touch icon and the manifest, and they exist', () => {
        const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

        for (const file of ['favicon.ico', 'apple-touch-icon.png']) {
            expect(html).toContain(`href="/${file}"`);
            expect(existsSync(publicFile(file))).toBe(true);
        }
        expect(html).toContain('href="/site.webmanifest"');
        // Vite's starter icon is gone for good.
        expect(existsSync(publicFile('favicon.svg'))).toBe(false);
    });

    it('the favicon holds 16, 32 and 48px images (Google wants a multiple of 48)', () => {
        const ico = readFileSync(publicFile('favicon.ico'));
        const count = ico.readUInt16LE(4);
        const sizes = Array.from({ length: count }, (_, index) => ico.readUInt8(6 + 16 * index));

        expect(sizes).toEqual([16, 32, 48]);
    });

    it('the manifest names the studio and points at icons that exist', () => {
        const manifest = JSON.parse(webManifest());

        expect(manifest.name).toBe('ijji labs');
        expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual([
            '192x192',
            '512x512',
        ]);
        for (const icon of manifest.icons) {
            expect(existsSync(publicFile(icon.src.slice(1)))).toBe(true);
        }
    });
});
