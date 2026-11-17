import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { paths } from '../../../../router/paths.ts';
import { Button, HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';
import { navbarItems } from './navbarItems.ts';
import type { NavbarProps } from './types.ts';

const NAV_MENU_ID = 'site-menu';

/** How far a page scrolls while the navbar's background fades in. */
const FADE_DISTANCE = 160;

/** Eases in and out, so the fade starts and finishes gently rather than with a corner. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const Navbar = ({ isGradientDark }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const hamburgerRef = useRef<HTMLButtonElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);

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

    // At the top of a page the navbar is see-through, showing the page behind it. As the page
    // scrolls, its dark background fades in over FADE_DISTANCE pixels (on Home, as the
    // gradient hero goes by), eased at both ends, following the scroll position frame by
    // frame. No CSS transition:
    // Lenis already smooths the scroll, and easing towards a target that moves every frame
    // lags and flickers. The opacity is set straight on the layer, so scrolling doesn't
    // re-render the navbar.
    useEffect(() => {
        const handleScroll = () => {
            const end = isHome ? window.innerHeight * 0.8 : FADE_DISTANCE;
            const start = end - FADE_DISTANCE;
            const progress = Math.min(Math.max((window.scrollY - start) / FADE_DISTANCE, 0), 1);
            const fill = smoothstep(progress);

            if (fillRef.current) fillRef.current.style.opacity = String(fill);
            setIsScrolled(fill === 1);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome]);

    // Every page but Home starts with a dark band, so the logo and menu icon stay white;
    // Home's depend on the gradient's palette until the navbar turns dark.
    const isWhite = !isHome || isScrolled || isGradientDark;

    return (
        <>
            <nav
                aria-label='Site'
                data-print='hide'
                data-scrolled={isScrolled}
                className='sticky top-0 left-0 w-full z-20 h-20 md:h-[clamp(80px,10vh,100px)]'
            >
                {/* The background, faded in with the scroll: a separate element, so changing
                its opacity leaves the logo and buttons alone. */}
                <div
                    ref={fillRef}
                    aria-hidden='true'
                    data-testid='navbar-fill'
                    className='absolute inset-0 -z-10 bg-ui-background-secondary opacity-0'
                />
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-380 mx-auto px-6 md:px-8'>
                    <Logo isMenuOpen={isOpen} isWhite={isWhite} />

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
                            isWhite={isWhite}
                            controls={NAV_MENU_ID}
                        />
                    </div>
                </div>
            </nav>

            <NavMenu id={NAV_MENU_ID} isOpen={isOpen} setIsOpen={setIsOpen} links={navbarItems} />
        </>
    );
};
