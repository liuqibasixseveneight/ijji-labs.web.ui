/**
 * The hover line for links in the site's chrome (the footer, and the menu's footer): a thin
 * yellow line along the text's foot that sweeps in from the left on hover or keyboard focus
 * (and, where a link adds `after:scale-x-100`, stays on the page you're on).
 *
 * Put it on the link, or on the text inside one marked `group`: `group-hover:` only matches
 * inside the group, so both are here. Don't put it inside an `overflow-hidden` box, which
 * would clip the line below the text.
 */
export const sweepUnderline =
    'relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-brand-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100';
