import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { RollingText } from '../RollingText/RollingText.tsx';
import type { NavbarLinkProps } from './types.ts';

const baseClasses =
    'group relative transition-colors duration-300 after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-0 after:bg-brand-primary after:transition-all after:duration-300 font-medium';

const hoverClasses = 'hover:text-brand-primary hover:after:w-full';

export const NavbarLink = ({ text, to, className }: NavbarLinkProps) => {
    return (
        <li className='uppercase'>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    clsx(
                        baseClasses,
                        hoverClasses,
                        className,
                        isActive && 'text-brand-primary! after:w-full',
                    )
                }
            >
                <RollingText>{text}</RollingText>
            </NavLink>
        </li>
    );
};
