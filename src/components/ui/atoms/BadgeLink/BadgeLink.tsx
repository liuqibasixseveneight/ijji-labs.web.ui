import type { BadgeLinkProps } from './types.ts';

export const BadgeLink = ({ label, href }: BadgeLinkProps) => (
    <a
        href={href}
        className='px-4 py-2 rounded-full border border-white/20 text-sm text-white/60 hover:border-white/50 hover:text-white transition-colors'
    >
        {label}
    </a>
);
