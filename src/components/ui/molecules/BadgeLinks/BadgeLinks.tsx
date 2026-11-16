import type { BadgeLinksProps } from './types.ts';
import { BadgeLink } from '../../atoms';

export const BadgeLinks = ({ links }: BadgeLinksProps) => (
    <div className='flex flex-wrap gap-3'>
        {links.map(({ label, href }) => (
            <BadgeLink key={href} label={label} href={href} />
        ))}
    </div>
);
