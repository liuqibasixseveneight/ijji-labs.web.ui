import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { NavMenuProps } from './types';
import { disableScrollLock, enableScrollLock } from './utils.ts';

const STAGGER = ['0ms', '60ms', '120ms', '180ms', '240ms'];

export const NavMenu = ({ isOpen, setIsOpen, links }: NavMenuProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const menuLinks = links ?? [
        { label: 'Home', to: '/', num: '00', description: 'Welcome' },
        { label: 'About', to: '/about', num: '01', description: 'Who we are' },
        { label: 'Services', to: '/services', num: '02', description: 'What we do' },
        { label: 'Projects', to: '/projects', num: '03', description: 'Our work' },
        { label: 'Contact', to: '/contact', num: '04', description: 'Say hello' },
    ];

    useEffect(() => {
        if (isOpen) enableScrollLock();
        else disableScrollLock();

        return () => disableScrollLock();
    }, [isOpen]);

    return (
        <div
            className={`fixed inset-0 z-10 bg-ui-background-secondary transition-transform duration-600 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <nav className='relative flex flex-col justify-center h-full max-w-360 mx-auto'>
                <span
                    aria-hidden='true'
                    className='absolute right-8 text-[20vw] font-serif font-thin text-white/5 select-none pointer-events-none'
                >
                    {hovered !== null ? menuLinks[hovered].num : ''}
                </span>

                <ul className='flex flex-col gap-8 pb-8 list-none p-0 m-0'>
                    {menuLinks.map((link, i) => (
                        <li
                            key={link.label}
                            className='flex min-h-24 border-t first:border-t-0 border-white/5'
                            style={{
                                opacity: isOpen ? 1 : 0,
                                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                                transition: `opacity 0.5s ease ${STAGGER[i]}, transform 0.5s ease ${STAGGER[i]}`,
                            }}
                        >
                            <Link
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                onFocus={() => setHovered(i)}
                                onBlur={() => setHovered(null)}
                                className='relative w-full flex-1 grid grid-cols-[3rem_1fr_auto] items-center gap-4 text-white no-underline overflow-hidden group'
                            >
                                <span className='absolute inset-0 bg-white/5 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 pointer-events-none' />

                                <span className='text-xs font-sans text-white/30'>{link.num}</span>

                                <span className='font-thin text-4xl md:text-6xl transition-transform duration-300 group-hover:italic group-hover:translate-x-2'>
                                    {link.label}
                                </span>

                                <span className='flex items-center gap-2 text-xs font-sans uppercase text-white/40 transition-colors duration-300 group-hover:text-white/70'>
                                    {link.description}
                                    <svg
                                        viewBox='0 0 14 14'
                                        fill='none'
                                        className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <path
                                            d='M1 13L13 1M13 1H4M13 1V10'
                                            stroke='currentColor'
                                            strokeWidth='1.2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};
