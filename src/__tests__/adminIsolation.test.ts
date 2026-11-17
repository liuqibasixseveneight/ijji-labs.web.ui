// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { describe, expect, it } from 'vitest';

import { llmsFullTxt, llmsTxt, prerenderPaths, sitemapEntries } from '../entry-server.tsx';
import { routes } from '../router/routes.tsx';

/**
 * The admin dashboard (src/admin) is its own page with its own bundle. Nothing public lists,
 * links to or loads it: not the routes, pre-rendering, the sitemap, robots.txt, llms.txt or
 * the screen map. scripts/check-build.mjs checks the built files the same way.
 */
const root = path.resolve(import.meta.dirname, '../..');
const ADMIN = /\/admin\b/;

const sourceFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(full);
        return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
    });

describe('the admin dashboard stays out of the public site', () => {
    it('is not in the public route table', () => {
        const paths = JSON.stringify(routes, (key, value) =>
            key === 'element' ? undefined : value,
        );
        expect(paths).not.toMatch(/admin/);
    });

    it('is not pre-rendered or in the sitemap', () => {
        expect(prerenderPaths().filter((p) => ADMIN.test(p))).toEqual([]);
        expect(sitemapEntries().filter((e) => ADMIN.test(e.path))).toEqual([]);
    });

    it('is not in llms.txt or llms-full.txt', () => {
        expect(llmsTxt()).not.toMatch(ADMIN);
        expect(llmsFullTxt()).not.toMatch(ADMIN);
    });

    it('is not in robots.txt (listing it would advertise it)', () => {
        const script = fs.readFileSync(path.join(root, 'scripts/prerender.mjs'), 'utf8');
        const robots = script.slice(script.indexOf("'robots.txt'"), script.indexOf('Sitemap:'));
        expect(robots).toContain('User-agent');
        expect(robots).not.toMatch(/admin/i);
    });

    it('is not on the screen map', () => {
        const window: { SCREEN_MAP?: unknown } = {};
        vm.runInNewContext(fs.readFileSync(path.join(root, 'docs/screen-map/screens.js'), 'utf8'), {
            window,
        });
        expect(JSON.stringify(window.SCREEN_MAP)).not.toMatch(ADMIN);
    });

    it('is never imported by the public site, and never imports server code', () => {
        const publicFiles = sourceFiles(path.join(root, 'src')).filter(
            (file) =>
                !file.includes(`${path.sep}admin${path.sep}`) &&
                !file.endsWith('adminIsolation.test.ts'),
        );
        const offenders = publicFiles.filter((file) =>
            /from\s+['"][^'"]*\/admin[/'"]/.test(fs.readFileSync(file, 'utf8')),
        );
        expect(offenders).toEqual([]);

        const adminFiles = sourceFiles(path.join(root, 'src/admin'));
        expect(adminFiles.length).toBeGreaterThan(0);
        for (const file of adminFiles) {
            const text = fs.readFileSync(file, 'utf8');
            expect(text, file).not.toMatch(/from\s+['"][^'"]*netlify\//);
            expect(text, file).not.toMatch(/import\.meta|process\.env/);
        }
    });

    it('has its own page that is never indexed', () => {
        const html = fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8');
        expect(html).toContain('<meta name="robots" content="noindex, nofollow, noarchive" />');
        expect(html).toContain('/src/admin/main.tsx');
    });

    it('is fenced off in netlify.toml: rewritten to its page, never cached or indexed', () => {
        const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
        expect(toml).toMatch(/from = "\/admin\/\*"\s+to = "\/admin\/index.html"\s+status = 200/);
        for (const route of ['/admin', '/admin/*', '/api/admin/*']) {
            const block = toml.slice(toml.indexOf(`for = "${route}"`));
            expect(block).toMatch(
                /^for = "[^"]+"\s+\[headers.values\]\s+Cache-Control = "no-store"\s+X-Robots-Tag = "noindex, nofollow, noarchive"/,
            );
        }
    });
});
