import { site } from './site.ts';

/**
 * /site.webmanifest: the name and icons a phone uses when the site is added to its home
 * screen. The icons are the studio mark, full-bleed (the phone rounds the corners), made by
 * `npm run brand-images`.
 */
export const webManifest = () =>
    JSON.stringify(
        {
            name: site.name,
            short_name: site.name,
            description: site.tagline,
            start_url: '/',
            display: 'browser',
            background_color: '#121212',
            theme_color: '#121212',
            icons: [192, 512].map((size) => ({
                src: `/icon-${size}.png`,
                sizes: `${size}x${size}`,
                type: 'image/png',
                purpose: 'any maskable',
            })),
        },
        null,
        4,
    ) + '\n';
