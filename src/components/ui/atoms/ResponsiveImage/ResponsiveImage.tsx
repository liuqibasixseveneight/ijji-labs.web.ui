import { clsx } from 'clsx';

import type { ResponsiveImageProps } from './types.ts';

/**
 * A photo in AVIF or WebP at the width the screen needs, with its size reserved so the
 * page doesn't jump while it loads. Mark the first big image on a page `priority`.
 */
export const ResponsiveImage = ({
    image,
    alt,
    sizes = '(min-width: 1520px) 1440px, 100vw',
    priority = false,
    className,
}: ResponsiveImageProps) => (
    <picture className='contents'>
        <source type='image/avif' srcSet={image.avif} sizes={sizes} />
        <source type='image/webp' srcSet={image.webp} sizes={sizes} />
        <img
            src={image.fallback}
            alt={alt}
            width={image.width}
            height={image.height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            className={clsx('select-none [-webkit-user-drag:none]', className)}
        />
    </picture>
);
