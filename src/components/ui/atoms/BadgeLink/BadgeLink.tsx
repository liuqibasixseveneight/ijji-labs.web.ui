import { scrollToHash } from '../../../../lib/smoothScroll.ts';
import type { BadgeLinkProps } from './types.ts';

/** A jump link to a section further down the page, which glides there rather than jumping. */
export const BadgeLink = ({ label, href }: BadgeLinkProps) => (
    <a
        href={href}
        onClick={scrollToHash}
        className='px-4 py-2 rounded-full border border-white/20 text-sm text-white/60 hover:border-white/50 hover:text-white transition-colors'
    >
        {label}
    </a>
);
