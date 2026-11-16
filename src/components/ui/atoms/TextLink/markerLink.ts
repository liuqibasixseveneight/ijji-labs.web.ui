import { clsx } from 'clsx';

/**
 * The site's text-link style: a yellow marker stroke under the link that rises to fill it on
 * hover or keyboard focus. It's a layer behind the text, scaled up from the bottom (a
 * transform, so it animates smoothly). On dark sections the text turns dark as the yellow
 * fills, like the buttons. Used by TextLink and MoreLink; links inside running policy text
 * use the `link-highlight link-marked` utilities in index.css, which wrap across lines.
 */
export const markerLink = (tone: 'dark' | 'light') =>
    clsx(
        // Padding is set by each link (TextLink, MoreLink), with a matching negative margin so
        // the text still lines up with what's around it.
        'relative isolate transition-colors duration-500',
        'before:absolute before:inset-0 before:-z-10 before:bg-brand-primary before:origin-bottom before:scale-y-[0.2]',
        'before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:before:scale-y-100 focus-visible:before:scale-y-100',
        tone === 'dark'
            ? 'text-white hover:text-ui-background-primary focus-visible:text-ui-background-primary'
            : 'text-ui-background-primary',
    );
