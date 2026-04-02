import { Link } from 'react-router-dom';

import type { NavMenuItemProps } from './types';

export const NavMenuItem = ({ link, isHovered, onHover, onLeave, setIsOpen }: NavMenuItemProps) => {
    return (
        <li className='relative flex min-h-24 border-t first:border-t-0 border-white/5 px-10 transition-opacity duration-500 ease-in-out'>
            <span
                aria-hidden='true'
                className={`absolute inset-0 bg-white/5 origin-left transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'} transform transition-transform duration-500 ease-in-out`}
            />

            <Link
                to={link.to}
                onClick={() => setIsOpen(false)}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onFocus={onHover}
                onBlur={onLeave}
                className='relative w-full flex-1 grid grid-cols-[3rem_1fr_auto] items-center gap-4 text-white no-underline overflow-hidden'
            >
                <span
                    className={`text-xs transition-all duration-300 relative z-10 ${isHovered ? 'text-brand-primary font-bold' : 'text-[rgba(255,255,255,0.3)]'}`}
                >
                    {link.num}
                </span>

                <span
                    className={`font-normal text-4xl md:text-6xl transition-all duration-300 relative z-10 ${isHovered ? 'text-brand-primary italic translate-x-2' : 'text-white translate-x-0'}`}
                >
                    {link.label}
                </span>

                <span
                    className={`flex items-center gap-2 text-xs uppercase transition-colors duration-300 relative z-10 ${isHovered ? 'text-brand-primary' : 'text-[rgba(255,255,255,0.4)]'}`}
                >
                    {link.description}
                    <svg
                        viewBox='0 0 14 14'
                        fill='none'
                        className={`w-3 h-3 transition-opacity duration-300 ${isHovered ? 'opacity-100 stroke-brand-primary' : 'opacity-50 stroke-current'}`}
                    >
                        <path
                            d='M1 13L13 1M13 1H4M13 1V10'
                            strokeWidth='1.2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </span>
            </Link>
        </li>
    );
};
