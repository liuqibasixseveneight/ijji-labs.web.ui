import { useState, useEffect } from 'react';

import { HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';
import { navbarItems } from './navbarItems.ts';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleOpenNavMenu = () => {
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY >= window.innerHeight * 0.8) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={`sticky top-0 left-0 w-full z-20 h-[10vh] transition-colors duration-300 ease-in-out ${
                    isScrolled ? 'bg-ui-background-secondary' : 'bg-transparent'
                }`}
            >
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-360 mx-auto px-4'>
                    <Logo isMenuOpen={isOpen} isWhite={isScrolled} />
                    <HamburgerIcon
                        isOpen={isOpen}
                        setIsOpen={handleOpenNavMenu}
                        isWhite={isScrolled}
                    />
                </div>
            </nav>

            <NavMenu isOpen={isOpen} setIsOpen={setIsOpen} links={navbarItems} />
        </>
    );
};
