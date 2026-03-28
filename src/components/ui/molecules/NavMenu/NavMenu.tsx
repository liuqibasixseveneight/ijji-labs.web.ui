import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import type { NavMenuProps } from './types';
import { disableScrollLock, enableScrollLock } from './utils.ts';

export const NavMenu = ({ isOpen, setIsOpen, links }: NavMenuProps) => {
    const menuLinks = links ?? [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Services', to: '/services' },
        { label: 'Projects', to: '/projects' },
        { label: 'Contact', to: '/contact' },
    ];

    useEffect(() => {
        if (isOpen) enableScrollLock();
        else disableScrollLock();

        return () => disableScrollLock();
    }, [isOpen]);

    return (
        <div
            className={`fixed top-0 left-0 w-full h-screen z-10 bg-ui-background-secondary transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className='flex flex-col items-center justify-center h-full space-y-8'>
                {menuLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className='text-3xl font-semibold text-ui-background-primary'
                        onClick={() => setIsOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};
