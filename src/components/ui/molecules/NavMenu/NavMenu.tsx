import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

import { site } from '../../../../content/site.ts';
import { NavMenuItem, RollingText } from '../../atoms';
import type { NavMenuProps } from './types.ts';
import { disableScrollLock, enableScrollLock } from './utils.ts';

export const NavMenu = ({ id, isOpen, setIsOpen, links }: NavMenuProps) => {
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { pathname } = useLocation();

    useEffect(() => {
        if (isOpen) enableScrollLock();
        else disableScrollLock();

        return () => disableScrollLock();
    }, [isOpen]);

    // Opening the menu takes keyboard focus to its first link.
    useEffect(() => {
        if (isOpen) menuRef.current?.querySelector('a')?.focus();
    }, [isOpen]);

    // The big number behind the list: the row being pointed at, or else the page you're on.
    const current = links.findIndex((link) => link.to === pathname);
    const ghost = hoveredItem ?? (current === -1 ? null : current);

    return (
        <div
            ref={menuRef}
            id={id}
            // Off-screen while closed: keep its links out of the tab order and the accessibility tree.
            inert={!isOpen}
            aria-hidden={!isOpen}
            className={clsx(
                'fixed inset-0 z-10 bg-ui-background-secondary transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]',
                isOpen ? 'translate-x-0' : '-translate-x-full',
            )}
        >
            {/* Clears the navbar at the top, then the list, then the studio's details. */}
            <div className='relative flex flex-col h-full max-w-380 mx-auto px-6 md:px-8 pt-20 md:pt-[clamp(80px,12vh,116px)] pb-6 [@media(max-height:500px)]:pb-3 overflow-y-auto'>
                <span
                    aria-hidden='true'
                    className='hidden md:block absolute right-8 top-1/2 -translate-y-1/2 text-[22vw] leading-none font-extrabold tracking-tighter tabular-nums text-white/[0.03] select-none pointer-events-none'
                >
                    {ghost !== null ? links[ghost].num : ''}
                </span>

                <nav aria-label='Main' className='relative flex-1 flex flex-col justify-center'>
                    <ul className='flex flex-col border-b border-white/5'>
                        {links.map((link, index) => (
                            <NavMenuItem
                                key={link.to}
                                link={link}
                                index={index}
                                isMenuOpen={isOpen}
                                setIsOpen={setIsOpen}
                                onHover={() => setHoveredItem(index)}
                                onLeave={() => setHoveredItem(null)}
                            />
                        ))}
                    </ul>
                </nav>

                <div
                    style={{ transitionDelay: isOpen ? `${150 + links.length * 60}ms` : '0ms' }}
                    className={clsx(
                        'relative flex flex-wrap items-center justify-between gap-x-8 gap-y-2 pt-6 [@media(max-height:500px)]:pt-3 text-sm text-white/60 transition-opacity duration-700',
                        isOpen ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <a
                        href={`mailto:${site.email}`}
                        // overflow-hidden: the rolling copy waiting below is clipped from view,
                        // but would still count towards the menu's scroll height.
                        className='group overflow-hidden text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors'
                    >
                        <RollingText>{site.email}</RollingText>
                    </a>
                    <span>{site.location}</span>
                </div>
            </div>
        </div>
    );
};
