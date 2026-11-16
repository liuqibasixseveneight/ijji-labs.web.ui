import { clsx } from 'clsx';

import type { RollingTextProps } from './types.ts';

/**
 * A symmetric ease-in-out, so the text keeps moving until it lands: an ease-out with a long
 * tail spent a quarter of a second creeping the last half pixel, which reads as a wobble.
 * will-change keeps the text on its own layer, so it isn't redrawn (and snapped to the pixel
 * grid) as the roll ends. MoreLink rolls with the same values.
 */
export const ROLL_MOTION =
    'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform';

const roll = `inline-block ${ROLL_MOTION}`;

/**
 * Text that rolls when its link or button (marked `group`) is hovered or focused: it slides
 * up and out as a copy rises in from below. The copy is hidden from screen readers, so the
 * text is read once. It's clipped with clip-path rather than overflow, which would move an
 * inline-block's baseline and knock a link in a sentence off the line.
 *
 * `rollInClassName` styles only the copy that rolls in, e.g. dark text arriving on a yellow
 * fill, so the colour changes with the roll instead of fading through grey.
 */
export const RollingText = ({ children, className, rollInClassName }: RollingTextProps) => (
    <span className={clsx('relative inline-block [clip-path:inset(0)]', className)}>
        <span
            className={clsx(
                roll,
                'group-hover:-translate-y-full group-focus-visible:-translate-y-full',
            )}
        >
            {children}
        </span>
        <span
            aria-hidden='true'
            className={clsx(
                roll,
                'absolute inset-0 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0',
                rollInClassName,
            )}
        >
            {children}
        </span>
    </span>
);
