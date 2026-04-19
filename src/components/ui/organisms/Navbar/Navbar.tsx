import { useState, useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';
import { navbarItems } from './navbarItems.ts';
import type { NavbarProps } from './types.ts';

export const Navbar = ({ isGradientDark }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const handleOpenNavMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const handleRouteChange = useEffectEvent(() => {
        window.scrollTo(0, 0);
        setIsOpen(false);
    });

    useEffect(() => {
        handleRouteChange();
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY >= window.innerHeight * 0.8);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={`sticky top-0 left-0 w-full z-20 h-16 md:h-[10dvh] transition-colors duration-300 ease-in-out ${
                    isScrolled ? 'bg-ui-background-secondary' : 'bg-transparent'
                }`}
            >
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-380 mx-auto px-6 md:px-8'>
                    <Logo isMenuOpen={isOpen} isWhite={isScrolled || isGradientDark} />
                    <HamburgerIcon
                        isOpen={isOpen}
                        setIsOpen={handleOpenNavMenu}
                        isWhite={isScrolled || isGradientDark}
                    />
                </div>
            </nav>

            <NavMenu isOpen={isOpen} setIsOpen={setIsOpen} links={navbarItems} />
        </>
    );
};
