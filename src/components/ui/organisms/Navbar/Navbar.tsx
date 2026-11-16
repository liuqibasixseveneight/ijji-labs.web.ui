import { useState, useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { Button, HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';
import { navbarItems } from './navbarItems.ts';
import type { NavbarProps } from './types.ts';

const NAV_MENU_ID = 'site-menu';

export const Navbar = ({ isGradientDark }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === '/';

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
                className={`sticky top-0 left-0 w-full z-20 h-16 md:h-[clamp(64px,10vh,100px)] transition-colors duration-300 ease-in-out ${
                    showScrolledStyles ? 'bg-ui-background-secondary' : 'bg-transparent'
                }`}
            >
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-380 mx-auto px-6 md:px-8'>
                    <Logo isMenuOpen={isOpen} isWhite={showScrolledStyles || isGradientDark} />

                    <div className={'flex items-center justify-center gap-10'}>
                        <div className='hidden md:block'>
                            <Button
                                type='internal-link'
                                to='/contact'
                                label='Get in touch'
                                className='self-center'
                            />
                        </div>

                        <HamburgerIcon
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
