import { clsx } from 'clsx';

import { useHydrated } from '../../../../lib/useHydrated.ts';
import type { RollingTextProps } from './types.ts';

/**
 * A symmetric ease-in-out, so the text keeps moving until it lands: an ease-out with a long
 * tail spent a quarter of a second creeping the last half pixel, which reads as a wobble.
 * will-change keeps the text on its own layer, so it isn't redrawn (and snapped to the pixel
 * grid) as the roll ends. MoreLink rolls with the same values.
 */
export const ROLL_MOTION =
    'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform';

/**
 * How far the text rolls: its own height plus 0.25em. Letters' ink can reach past the line
 * box, most of all with tight leading (the menu's labels, at 1.05, put descenders about
 * 0.03em below it), so rolling exactly one line left the bottoms of g, j, p, q and y showing
 * along the top. The extra clears the clip (which itself reaches 0.1em past the line box,
 * so descenders aren't shaved at rest) with room to spare. MoreLink uses the same values.
 */
export const ROLL_OUT =
    'group-hover:translate-y-[calc(-100%_-_0.25em)] group-focus-visible:translate-y-[calc(-100%_-_0.25em)]';
export const ROLL_IN =
    'translate-y-[calc(100%_+_0.25em)] group-hover:translate-y-0 group-focus-visible:translate-y-0';

const roll = `inline-block ${ROLL_MOTION}`;

/**
 * Text that rolls when its link or button (marked `group`) is hovered or focused: it slides
 * up and out as a copy rises in from below. The copy is hidden from screen readers, so the
 * text is read once, and it's added only in the browser, so the pre-rendered HTML that
 * search engines and AI crawlers read has the text once too. It's clipped with clip-path rather than overflow, which would move an
 * inline-block's baseline and knock a link in a sentence off the line.
 *
 * `rollInClassName` styles only the copy that rolls in, e.g. dark text arriving on a yellow
 * fill, so the colour changes with the roll instead of fading through grey.
 */
export const RollingText = ({ children, className, rollInClassName }: RollingTextProps) => {
    const hydrated = useHydrated();

    return (
        // Clipped 0.1em beyond the line box, top and bottom, so descenders and accents show.
        <span className={clsx('relative inline-block [clip-path:inset(-0.1em_0)]', className)}>
            <span className={clsx(roll, ROLL_OUT)}>{children}</span>
            {hydrated && (
                <span
                    aria-hidden='true'
                    className={clsx(roll, 'absolute inset-0', ROLL_IN, rollInClassName)}
                >
                    {children}
                </span>
            )}
        </span>
    );
};
