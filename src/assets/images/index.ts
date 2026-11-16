/**
 * The site's photos, as responsive sources. The files in optimized/ are made from the
 * originals here by `npm run images` (scripts/optimize-images.mjs).
 */
export interface ResponsiveImageSource {
    /** srcset strings, smallest first. */
    avif: string;
    webp: string;
    /** For browsers without AVIF or WebP. */
    fallback: string;
    /** The original's size, for the aspect ratio (prevents layout shift). */
    width: number;
    height: number;
}

const files = import.meta.glob<string>('./optimized/*', {
    eager: true,
    query: '?url',
    import: 'default',
});

const srcset = (name: string, ext: string) =>
    Object.entries(files)
        .map(([file, url]) => ({ match: file.match(new RegExp(`/${name}-(\\d+)\\.${ext}$`)), url }))
        .filter(({ match }) => match)
        .map(({ match, url }) => ({ width: Number(match![1]), url }))
        .sort((a, b) => a.width - b.width)
        .map(({ width, url }) => `${url} ${width}w`)
        .join(', ');

const image = (name: string, width: number, height: number): ResponsiveImageSource => ({
    avif: srcset(name, 'avif'),
    webp: srcset(name, 'webp'),
    fallback: files[`./optimized/${name}-1280.jpg`],
    width,
    height,
});

export const aboutImageOne = image('about-1', 1920, 1278);
export const aboutImageTwo = image('about-2', 1920, 1280);
export const projectsImageOne = image('projects-1', 1920, 1280);
export const servicesImageOne = image('services-1', 1920, 1280);

/** An app's icon (square), from src/assets/images/apps/<slug>.png. */
const appIcon = (slug: string): ResponsiveImageSource => ({
    avif: srcset(`app-${slug}`, 'avif'),
    webp: srcset(`app-${slug}`, 'webp'),
    fallback: files[`./optimized/app-${slug}-320.png`],
    width: 1024,
    height: 1024,
});

export const ijjiTrackerIcon = appIcon('ijji-tracker');

/**
 * Each app's icon, by slug. Kept here rather than in src/content/apps.ts, because the
 * Netlify functions read apps.ts and can't run Vite's import.meta.glob.
 */
export const appIcons: Record<string, ResponsiveImageSource> = {
    'ijji-tracker': ijjiTrackerIcon,
};
