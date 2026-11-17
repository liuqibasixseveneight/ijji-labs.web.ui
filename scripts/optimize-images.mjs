// Makes the responsive copies of the site's photos: AVIF and WebP at several widths, plus
// a JPEG fallback, in src/assets/images/optimized/. Run `npm run images` after adding or
// replacing a photo in src/assets/images/, and commit what it writes.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve(import.meta.dirname, '../src/assets/images');
const out = path.join(dir, 'optimized');
const WIDTHS = [640, 960, 1280, 1920];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
    const name = path.parse(file).name;
    const source = sharp(path.join(dir, file)).rotate();
    const { width } = await source.metadata();

    for (const w of WIDTHS.filter((w) => w <= width)) {
        const resized = source.clone().resize({ width: w, withoutEnlargement: true });
        await resized
            .clone()
            .avif({ quality: 50, effort: 6 })
            .toFile(path.join(out, `${name}-${w}.avif`));
        await resized
            .clone()
            .webp({ quality: 72 })
            .toFile(path.join(out, `${name}-${w}.webp`));
    }

    await source
        .clone()
        .resize({ width: 1280 })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(path.join(out, `${name}-1280.jpg`));

    console.log(`${file}: ${WIDTHS.filter((w) => w <= width).join(', ')}w`);
}

// App icons (src/assets/images/apps/<slug>.png, square, 1024px, copied from the app's own
// project) show at 80-160px, so they get small sizes, plus a 512px PNG in public/ for the
// app's structured data, which needs a URL that never changes.
const ICON_WIDTHS = [160, 320, 480];
const appsDir = path.join(dir, 'apps');

for (const file of fs.readdirSync(appsDir).filter((f) => /\.png$/i.test(f))) {
    const slug = path.parse(file).name;
    const source = sharp(path.join(appsDir, file));

    for (const w of ICON_WIDTHS) {
        const resized = source.clone().resize({ width: w });
        await resized
            .clone()
            .avif({ quality: 60, effort: 6 })
            .toFile(path.join(out, `app-${slug}-${w}.avif`));
        await resized
            .clone()
            .webp({ quality: 82 })
            .toFile(path.join(out, `app-${slug}-${w}.webp`));
    }

    await source
        .clone()
        .resize({ width: 320 })
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(out, `app-${slug}-320.png`));

    const publicDir = path.resolve(import.meta.dirname, '../public/apps', slug);
    fs.mkdirSync(publicDir, { recursive: true });
    await source
        .clone()
        .resize({ width: 512 })
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(publicDir, 'icon.png'));

    console.log(`apps/${file}: ${ICON_WIDTHS.join(', ')}w, public/apps/${slug}/icon.png`);
}
