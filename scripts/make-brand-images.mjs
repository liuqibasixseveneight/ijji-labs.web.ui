// Renders the images link previews and search engines use, in the site's own fonts and
// colours, with headless Chrome: public/social-preview.png (1200×630, Open Graph and
// Twitter), public/logo.png (512×512, the organisation's logo in structured data) and
// public/apple-touch-icon.png (180×180). Run `npm run brand-images` after changing the
// wording or the brand, and commit what it writes. Set CHROME_PATH if Chrome isn't found.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const fontFile = (pkg, file) =>
    pathToFileURL(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href;

const CHROME = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
].find((candidate) => candidate && fs.existsSync(candidate));

if (!CHROME) throw new Error('No Chrome or Edge found: set CHROME_PATH');

const style = `
    @font-face { font-family: Newsreader; src: url(${fontFile('newsreader', 'newsreader-latin-wght-normal.woff2')}); font-weight: 200 800; }
    @font-face { font-family: Grotesk; src: url(${fontFile('space-grotesk', 'space-grotesk-latin-wght-normal.woff2')}); font-weight: 300 700; }
    * { margin: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #121212; color: #fff; overflow: hidden; }
`;

const IMAGES = [
    {
        file: 'social-preview.png',
        width: 1200,
        height: 630,
        body: `
            <div style="height:100%;padding:80px 88px;display:flex;flex-direction:column;justify-content:space-between;position:relative">
                <div style="position:absolute;right:-60px;bottom:-140px;font:800 560px/1 Newsreader;color:rgba(255,255,255,0.04)">ijji</div>
                <div style="font:800 64px/1 Newsreader">ijji labs</div>
                <div>
                    <div style="font:700 76px/1.05 Grotesk;letter-spacing:-1px;max-width:900px">Designing websites that work</div>
                    <div style="margin-top:28px;font:400 30px/1.3 Grotesk;color:rgba(255,255,255,0.7)">An independent studio in Leeds · ijji-labs.com</div>
                </div>
                <div style="position:absolute;top:80px;right:88px;width:270px;height:64px;background:#faee47;clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%);border-radius:32px 0 0 32px;display:flex;align-items:center;justify-content:center;font:700 20px Grotesk;letter-spacing:3px;color:#121212">WEB DESIGN STUDIO</div>
            </div>`,
    },
    {
        file: 'logo.png',
        width: 512,
        height: 512,
        body: `
            <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">
                <div style="font:800 168px/0.9 Newsreader">ijji</div>
                <div style="font:800 168px/0.9 Newsreader;color:#faee47">labs</div>
            </div>`,
    },
    {
        file: 'apple-touch-icon.png',
        width: 180,
        height: 180,
        body: `
            <div style="height:100%;display:flex;align-items:center;justify-content:center;font:800 228px/1 Newsreader">ijji</div>`,
        // Chrome won't open a window this small, so it's drawn at 3× and scaled down.
        scale: 3,
    },
];

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-images-'));

for (const { file, width, height, body, scale = 1 } of IMAGES) {
    const html = path.join(temp, `${file}.html`);
    fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${style}</style>${body}`);

    execFileSync(
        CHROME,
        [
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            `--window-size=${width * scale},${height * scale}`,
            '--virtual-time-budget=2000',
            `--screenshot=${path.join(temp, file)}`,
            pathToFileURL(html).href,
        ],
        { stdio: 'ignore' },
    );

    await sharp(path.join(temp, file))
        .resize(width, height)
        .png()
        .toFile(path.join(root, 'public', file));

    console.log(`public/${file} (${width}×${height})`);
}

fs.rmSync(temp, { recursive: true, force: true });
