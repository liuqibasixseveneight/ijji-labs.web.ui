import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { paths } from '../../../../router/paths.ts';
import { Button, HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';
import { navbarItems } from './navbarItems.ts';
import type { NavbarProps } from './types.ts';

const NAV_MENU_ID = 'site-menu';

export const Navbar = ({ isGradientDark }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    const isHome = location.pathname === paths.home;

    const handleOpenNavMenu = () => {
        setIsOpen((prev) => !prev);
    };

    // A new page starts at the top, unless the link names a section (/projects#project-dedalus).
    const handleRouteChange = useEffectEvent(() => {
        const target = location.hash && document.getElementById(location.hash.slice(1));

        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);

        setIsOpen(false);
    });

    useEffect(() => {
        handleRouteChange();
    }, [location.pathname]);

    // Esc closes the menu and puts focus back on the button that opened it.
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setIsOpen(false);
            hamburgerRef.current?.focus();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY >= window.innerHeight * 0.8);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showScrolledStyles = !isHome || isScrolled;

    return (
        <>
            <nav
                aria-label='Site'
                data-print='hide'
                className={`sticky top-0 left-0 w-full z-20 h-16 md:h-[clamp(64px,10vh,100px)] transition-colors duration-300 ease-in-out ${
                    showScrolledStyles ? 'bg-ui-background-secondary' : 'bg-transparent'
                }`}
            >
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-380 mx-auto px-6 md:px-8'>
                    <Logo isMenuOpen={isOpen} isWhite={showScrolledStyles || isGradientDark} />

                    <div className='flex items-center justify-center gap-4 md:gap-10'>
                        <Button
                            type='internal-link'
                            to={paths.contact}
                            label='Get in touch'
                            size='compact'
                            className='self-center max-[359px]:hidden'
                        />

                        <HamburgerIcon
                            ref={hamburgerRef}
                            isOpen={isOpen}
                            setIsOpen={handleOpenNavMenu}
                            isWhite={showScrolledStyles || isGradientDark}
                            controls={NAV_MENU_ID}
                        />
                    </div>
                </div>
            </nav>

            <NavMenu id={NAV_MENU_ID} isOpen={isOpen} setIsOpen={setIsOpen} links={navbarItems} />
        </>
    );
};
