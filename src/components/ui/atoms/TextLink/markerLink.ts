import { clsx } from 'clsx';

/**
 * The site's text-link style: a yellow marker stroke under the link that rises to fill it on
 * hover or keyboard focus. It's a layer behind the text, scaled up from the bottom (a
 * transform, so it animates smoothly). Used by TextLink and MoreLink; links inside running
 * policy text use the `link-highlight link-marked` utilities in index.css, which wrap.
 *
 * The text itself doesn't change colour: it rolls (RollingText), and on dark sections the
 * copy that rolls in is already dark (`markerLinkRollIn`), so nothing fades through grey.
 *
 * `fill: false` keeps just the stroke, for links whose hover is the roll alone (MoreLink):
 * a roll reads cleanly only when both copies are the same colour on the same background.
 *
 * The stroke's resting thickness is a share of the link's height, `--marker-rest` (0.2 by
 * default); taller links set a smaller share so the stroke stays slim.
 */
export const markerLink = (tone: 'dark' | 'light', { fill = true }: { fill?: boolean } = {}) =>
    clsx(
        // Padding is set by each link (TextLink, MoreLink), with a matching negative margin so
        // the text still lines up with what's around it.
        'relative isolate',
        'before:absolute before:inset-0 before:-z-10 before:bg-brand-primary before:origin-bottom before:scale-y-[var(--marker-rest,0.2)]',
        fill && [
            'before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)]',
            'hover:before:scale-y-100 focus-visible:before:scale-y-100',
        ],
        tone === 'dark' ? 'text-white' : 'text-ui-background-primary',
    );

/** The colour of the copy that rolls in over a fill: dark on the yellow. */
export const markerLinkRollIn = 'text-ui-background-primary';
