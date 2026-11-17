// Runs after `vite build` (client) and `vite build --ssr` (server entry): writes every
// page as real HTML, plus 404.html, sitemap.xml and robots.txt. See `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const serverDir = path.join(root, 'dist-server');
const SITE_URL = 'https://www.ijji-labs.com';

const { render, prerenderPaths, sitemapEntries, llmsTxt, llmsFullTxt, webManifest } = await import(
    pathToFileURL(path.join(serverDir, 'entry-server.js')).href
);

// Preload the body font (Latin subset), so text appears in the right typeface without waiting
// for the stylesheet to be read. Newsreader (logo only) isn't preloaded: it would compete
// with each page's main image.
const assets = fs.readdirSync(path.join(dist, 'assets'));
const FONTS = [/^space-grotesk-latin-wght-normal-.*\.woff2$/];
const preloads = FONTS.map((pattern) => {
    const file = assets.find((name) => pattern.test(name));
    if (!file) throw new Error(`No font matches ${pattern}: update FONTS in scripts/prerender.mjs`);
    return `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin>`;
}).join('\n');

const template = fs
    .readFileSync(path.join(dist, 'index.html'), 'utf8')
    .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n${preloads}`);

// Tags a page puts in <head> through PageMeta. React leaves them in the rendered markup;
// they belong in <head>, where the browser and crawlers read them.
const HEAD_TAG =
    /<title>[\s\S]*?<\/title>|<meta (?:name|property)="(?:description|robots|og:[a-z_]+|twitter:[a-z_]+)"[^>]*\/?>|<link rel="canonical"[^>]*\/?>/g;

const page = async (url) => {
    const markup = await render(url);
    const head = markup.match(HEAD_TAG) ?? [];
    const body = markup.replace(HEAD_TAG, '');

    if (!head.some((tag) => tag.startsWith('<title>'))) {
        throw new Error(`${url} has no <title>: give the page a PageMeta`);
    }

    return template.replace('</head>', `${head.join('\n')}\n</head>`).replace('<!--app-->', body);
};

const write = (file, contents) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
};

const urls = prerenderPaths();

// Each page is written as about/index.html and about.html, so /about and /about/ both
// serve it directly, whatever the host's rules for directories and extensions.
for (const url of urls) {
    const html = await page(url);
    if (url === '/') {
        write(path.join(dist, 'index.html'), html);
        continue;
    }
    write(path.join(dist, url.slice(1), 'index.html'), html);
    write(path.join(dist, `${url.slice(1)}.html`), html);
}

// Netlify serves 404.html, with a 404 status, for any address that isn't a file.
write(path.join(dist, '404.html'), await page('/404'));

write(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries()
    .map(
        ({ path: url, lastmod }) =>
            `    <url><loc>${SITE_URL}${url}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n')}
</urlset>
`,
);

// Everyone is welcome, including AI search and answer engines, so that ijji labs and our
// apps are described accurately. Named here so the intent is explicit.
write(
    path.join(dist, 'robots.txt'),
    `# A plain-text summary of this site for AI assistants: ${SITE_URL}/llms.txt
User-agent: *
Allow: /

User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
);

// llmstxt.org: the site in Markdown for AI assistants and answer engines.
write(path.join(dist, 'llms.txt'), llmsTxt());
write(path.join(dist, 'llms-full.txt'), llmsFullTxt());

// The home-screen name and icons (the studio mark), from the same content.
write(path.join(dist, 'site.webmanifest'), webManifest());

fs.rmSync(serverDir, { recursive: true, force: true });

console.log(
    `Pre-rendered ${urls.length} pages, 404.html, sitemap.xml, robots.txt, llms.txt, llms-full.txt and site.webmanifest`,
);
