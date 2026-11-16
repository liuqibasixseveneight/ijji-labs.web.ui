import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { markerLink } from './markerLink.ts';
import type { TextLinkProps } from './types.ts';

/** A link in a line of text, in the site's marker style (see markerLink). */
export const TextLink = ({ to, children, tone = 'dark', className }: TextLinkProps) => (
    <Link to={to} className={clsx('font-medium px-1 -mx-1', markerLink(tone), className)}>
        {children}
    </Link>
);
