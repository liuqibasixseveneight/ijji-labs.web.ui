import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import type { TextLinkProps } from './types.ts';

const baseClasses =
    'relative font-medium transition-colors duration-300 hover:text-brand-primary after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-brand-primary after:transition-all after:duration-300';

export const TextLink = ({ to, children, underline = 'hover', className }: TextLinkProps) => (
    <NavLink
        to={to}
        className={clsx(
            baseClasses,
            underline === 'always' ? 'after:w-full' : 'after:w-0 hover:after:w-full',
            className,
        )}
    >
        {children}
    </NavLink>
);
