import { Link } from 'react-router-dom';

import { ArtisticFrame } from '../../atoms';
import type { LinkCardProps } from './types.ts';

/**
 * A whole card that goes to another page, for white sections: a title, a line about the page
 * and an arrow. On hover or focus the card fills yellow and the arrow moves on. The link is
 * outside the cut-corner frame, so its focus ring isn't clipped.
 */
export const LinkCard = ({ title, description, to }: LinkCardProps) => (
    <Link to={to} className='group block h-full'>
        <ArtisticFrame
            cutSize={24}
            className='h-full bg-neutral-100 transition-colors duration-300 group-hover:bg-brand-primary group-focus-visible:bg-brand-primary'
        >
            <div className='flex flex-col gap-3 p-6 md:p-8 h-full'>
                <span className='flex items-center justify-between gap-4'>
                    <span className='text-xl font-semibold tracking-tight text-ui-background-primary'>
                        {title}
                    </span>
                    <svg
                        aria-hidden='true'
                        className='w-5 h-5 shrink-0 text-ui-background-primary transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M5 12h14m-6-6 6 6-6 6'
                        />
                    </svg>
                </span>
                <span className='text-base leading-relaxed text-neutral-600 group-hover:text-ui-background-primary group-focus-visible:text-ui-background-primary'>
                    {description}
                </span>
            </div>
        </ArtisticFrame>
    </Link>
);
