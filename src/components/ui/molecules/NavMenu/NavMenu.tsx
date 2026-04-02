import { useEffect, useState } from 'react';

import type { NavMenuProps } from './types';
import { disableScrollLock, enableScrollLock } from './utils';
import { NavMenuItem } from '../../atoms';

export const NavMenu = ({ isOpen, setIsOpen, links }: NavMenuProps) => {
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);

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
            <nav className='relative flex flex-col justify-center h-full max-w-380 px-8 mx-auto'>
                <span
                    aria-hidden='true'
                    className='absolute right-8 top-1/2 -translate-y-1/2 text-[20vw] font-thin text-white/5 select-none'
                >
                    {hoveredItem !== null ? links[hoveredItem].num : ''}
                </span>

                <ul className='flex flex-col gap-8 pb-8 list-none p-0 m-0'>
                    {links.map((link, index: number) => (
                        <NavMenuItem
                            key={`${link.label}-${index}`}
                            link={link}
                            isHovered={hoveredItem === index}
                            setIsOpen={setIsOpen}
                            onHover={() => setHoveredItem(index)}
                            onLeave={() => setHoveredItem(null)}
                        />
                    ))}
                </ul>
            </nav>
        </div>
    );
};
