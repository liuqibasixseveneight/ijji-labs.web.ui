import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { markerLink } from '../TextLink/markerLink.ts';
import type { MoreLinkProps } from './types.ts';

/** "More about us →": the way on from a section to the page that covers it in full. */
export const MoreLink = ({ to, children, tone = 'dark', className }: MoreLinkProps) => (
    <Link
        to={to}
        className={clsx(
            // The right padding is the left plus the arrow's 4px slide (translate-x-1), so once it
            // has moved, the space after the arrow matches the space before the text.
            'group inline-flex items-center gap-3 self-start py-1.5 pl-3 pr-4 -ml-3 -mr-4 text-sm font-bold tracking-widest uppercase',
            markerLink(tone),
            className,
        )}
    >
        {children}
        <svg
            viewBox='0 0 14 14'
            fill='none'
            aria-hidden='true'
            className='w-3 h-3 stroke-current transition-transform group-hover:translate-x-1'
        >
            <path
                d='M1 7H13M13 7L7 1M13 7L7 13'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    </Link>
);
