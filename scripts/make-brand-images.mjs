// Renders the images link previews, browsers and search engines use, in the site's own fonts
// and colours, with headless Chrome:
// - public/social-preview.png (1200×630, Open Graph and Twitter);
// - the studio mark (StudioMark: "ij" on the yellow, as in the footer) as public/logo.png
//   (512×512, the organisation's logo in structured data), public/favicon.ico (16, 32 and
//   48px; Google's results want a multiple of 48), public/apple-touch-icon.png (180×180) and
//   public/icon-192.png / icon-512.png (the web manifest). The favicon and logo keep the
//   rounded corners; the phone icons are full-bleed, as phones round them themselves.
// Run `npm run brand-images` after changing the wording or the brand, and commit what it
// writes. Set CHROME_PATH if Chrome isn't found.
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

/**
 * The studio mark at 512px, in StudioMark's proportions: the "ij" is 20/32 of the tile, the
 * corners 8.8/32, and the text sits 1/32 below centre, where it looks centred.
 */
const mark = ({ rounded }) => `
    <div style="width:512px;height:512px;background:#faee47;border-radius:${rounded ? 141 : 0}px;display:flex;align-items:center;justify-content:center">
        <div style="font:800 320px/1 Newsreader;color:#121212;transform:translateY(16px)">ij</div>
    </div>`;

/** An .ico holding PNGs, one per size (every browser since IE reads PNG entries). */
const ico = (pngs) => {
    const header = Buffer.alloc(6 + 16 * pngs.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    let offset = header.length;
    pngs.forEach(({ size, data }, index) => {
        const entry = 6 + 16 * index;
        header.writeUInt8(size % 256, entry);
        header.writeUInt8(size % 256, entry + 1);
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(data.length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += data.length;
    });
    return Buffer.concat([header, ...pngs.map(({ data }) => data)]);
};

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
        file: 'studio-mark.png',
        width: 512,
        height: 512,
        body: mark({ rounded: true }),
        transparent: true,
        outputs: [
            { file: 'logo.png', size: 512 },
            { file: 'favicon.ico', sizes: [16, 32, 48] },
        ],
    },
    {
        file: 'studio-mark-full.png',
        width: 512,
        height: 512,
        body: mark({ rounded: false }),
        outputs: [
            { file: 'apple-touch-icon.png', size: 180 },
            { file: 'icon-192.png', size: 192 },
            { file: 'icon-512.png', size: 512 },
        ],
    },
];

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-images-'));

for (const { file, width, height, body, scale = 1, transparent = false, outputs } of IMAGES) {
    const html = path.join(temp, `${file}.html`);
    const page = transparent
        ? style.replace('background: #121212;', 'background: transparent;')
        : style;
    fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${page}</style>${body}`);

    execFileSync(
        CHROME,
        [
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            ...(transparent ? ['--default-background-color=00000000'] : []),
            `--window-size=${width * scale},${height * scale}`,
            '--virtual-time-budget=2000',
            `--screenshot=${path.join(temp, file)}`,
            pathToFileURL(html).href,
        ],
        { stdio: 'ignore' },
    );

    const shot = path.join(temp, file);

    if (!outputs) {
        await sharp(shot)
            .resize(width, height)
            .png()
            .toFile(path.join(root, 'public', file));
        console.log(`public/${file} (${width}×${height})`);
        continue;
    }

    for (const output of outputs) {
        const target = path.join(root, 'public', output.file);

        if (output.sizes) {
            const pngs = await Promise.all(
                output.sizes.map(async (size) => ({
                    size,
                    data: await sharp(shot).resize(size, size).png().toBuffer(),
                })),
            );
            fs.writeFileSync(target, ico(pngs));
            console.log(`public/${output.file} (${output.sizes.join(', ')})`);
        } else {
            await sharp(shot).resize(output.size, output.size).png().toFile(target);
            console.log(`public/${output.file} (${output.size}×${output.size})`);
        }
    }
}

fs.rmSync(temp, { recursive: true, force: true });
