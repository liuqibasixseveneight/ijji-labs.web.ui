const RESIZING_CDN = /(^|\.)images\.unsplash\.com$|\.imgix\.net$/;

/**
 * An image from a CDN that resizes on request (Unsplash, imgix), at `width` and in the
 * best format the browser takes. Other URLs are returned as they are.
 */
export const cdnImage = (url: string, width: number) => {
    const next = new URL(url);
    if (!RESIZING_CDN.test(next.hostname)) return url;

    next.searchParams.set('w', String(width));
    next.searchParams.set('auto', 'format');
    next.searchParams.set('q', '70');
    return next.toString();
};
