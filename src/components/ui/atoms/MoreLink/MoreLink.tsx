import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { ROLL_MOTION } from '../RollingText/RollingText.tsx';
import { markerLink } from '../TextLink/markerLink.ts';
import type { MoreLinkProps } from './types.ts';

// Rolls exactly like the buttons' label (see RollingText).
const ROLL = ROLL_MOTION;
const ROW = 'flex items-center gap-3';

const Row = ({ children }: { children: MoreLinkProps['children'] }) => (
    <>
        {children}
        <svg
            viewBox='0 0 14 14'
            fill='none'
            aria-hidden='true'
            className='w-3 h-3 shrink-0 stroke-current'
        >
            <path
                d='M1 7H13M13 7L7 1M13 7L7 13'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    </>
);

/**
 * "More about us →": the way on from a section to the page that covers it in full.
 *
 * At rest it has a slim yellow marker stroke. On hover or focus the row (text and arrow)
 * rolls within its line exactly like the buttons' label: it slides up and out as an
 * identical copy rolls in. There's no fill, because a roll only reads as one smooth motion
 * when both copies are the same colour on the same background. The copy is hidden from
 * screen readers.
 */
export const MoreLink = ({ to, children, tone = 'dark', className }: MoreLinkProps) => (
    <Link
        to={to}
        className={clsx(
            // A slim stroke (8% of the link's height, about 2.5px). The negative margin keeps
            // the text lined up with what's around it.
            'group inline-flex self-start py-1.5 px-3 -mx-3 text-sm font-bold tracking-widest uppercase [--marker-rest:0.08]',
            markerLink(tone, { fill: false }),
            className,
        )}
    >
        <span className='relative block overflow-hidden'>
            <span
                className={clsx(
                    ROW,
                    ROLL,
                    'group-hover:-translate-y-full group-focus-visible:-translate-y-full',
                )}
            >
                <Row>{children}</Row>
            </span>
            <span
                aria-hidden='true'
                className={clsx(
                    ROW,
                    ROLL,
                    'absolute inset-0 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0',
                )}
            >
                <Row>{children}</Row>
            </span>
        </span>
    </Link>
);
