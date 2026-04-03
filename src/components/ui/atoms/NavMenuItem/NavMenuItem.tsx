import { Link } from 'react-router-dom';

import type { NavMenuItemProps } from './types';

export const NavMenuItem = ({ link, isHovered, onHover, onLeave, setIsOpen }: NavMenuItemProps) => {
    return (
        <li className='relative border-t first:border-t-0 border-white/5 transition-opacity duration-500 ease-in-out'>
            {/* Hover fill */}
            <span
                aria-hidden='true'
                className={`absolute inset-0 bg-white/5 origin-left transition-transform duration-500 ease-in-out ${
                    isHovered ? 'scale-x-100' : 'scale-x-0'
                }`}
            />

            <Link
                to={link.to}
                onClick={() => setIsOpen(false)}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onFocus={onHover}
                onBlur={onLeave}
                className='relative flex items-center gap-3 md:gap-4 px-4 md:px-10 py-5 md:py-6 text-white no-underline w-full'
            >
                {/* Number */}
                <span
                    className={`shrink-0 w-8 text-xs transition-all duration-300 ${
                        isHovered ? 'text-brand-primary font-bold' : 'text-white/30'
                    }`}
                >
                    {link.num}
                </span>

                {/* Label + description stacked on mobile, row on md+ */}
                <span className='flex-1 flex flex-col md:flex-row md:items-center md:gap-4 min-w-0'>
                    <span
                        className={`font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight transition-all duration-300 ${
                            isHovered
                                ? 'text-brand-primary italic translate-x-1 md:translate-x-2'
                                : 'text-white translate-x-0'
                        }`}
                    >
                        {link.label}
                    </span>

                    {/* Description — shown below label on mobile, to the right on md+ */}
                    {link.description && (
                        <span
                            className={`mt-0.5 md:mt-0 md:ml-auto text-xs uppercase tracking-wide transition-colors duration-300 shrink-0 ${
                                isHovered ? 'text-brand-primary' : 'text-white/40'
                            }`}
                        >
                            {link.description}
                        </span>
                    )}
                </span>

                {/* Arrow — hidden on small screens to save space */}
                <svg
                    viewBox='0 0 14 14'
                    fill='none'
                    className={`hidden sm:block shrink-0 w-3 h-3 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100 stroke-brand-primary' : 'opacity-50 stroke-current'
                    }`}
                >
                    <path
                        d='M1 13L13 1M13 1H4M13 1V10'
                        strokeWidth='1.2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
            </Link>
        </li>
    );
};
