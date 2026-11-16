import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import type { MoreLinkProps } from './types.ts';

/** "More about us →": the way on from a section to the page that covers it in full. */
export const MoreLink = ({ to, children, tone = 'dark', className }: MoreLinkProps) => (
    <Link
        to={to}
        className={clsx(
            'group inline-flex items-center gap-3 self-start text-sm font-bold tracking-widest uppercase transition-colors',
            tone === 'dark'
                ? 'text-white hover:text-brand-primary'
                : 'text-ui-background-primary hover:text-neutral-500',
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
