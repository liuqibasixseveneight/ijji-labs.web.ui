import { clsx } from 'clsx';

import type { StudioMarkProps } from './types.ts';

/**
 * The studio's small mark, the counterpart to an app's icon: "ij" in the logo's serif on the
 * studio yellow, in the same rounded shape as the app icons. Decorative: the name is always
 * written beside it.
 */
export const StudioMark = ({ className }: StudioMarkProps) => (
    <span
        aria-hidden='true'
        className={clsx(
            'inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-[0.55rem]',
            'bg-brand-primary text-ui-background-primary',
            className,
        )}
    >
        {/* Nudged down a pixel: measured by ink the "ij" is centred a touch higher, but the
        dots are small and the eye centres on the stems, so this is where it looks centred. */}
        <span className='font-newsreader font-extrabold text-xl leading-none translate-y-px'>
            ij
        </span>
    </span>
);
