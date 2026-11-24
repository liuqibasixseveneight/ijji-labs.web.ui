import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import type { MouseEvent } from 'react';

import { scrollToTop } from '../../../../lib/smoothScroll.ts';
import type { LogoProps } from './types.ts';

/**
 * The studio's name, linking home. From another page it opens Home at the top (every new
 * page starts there); on Home itself, where the link wouldn't change the page, it glides back
 * to the top and moves focus there, as Back to top does.
 */
export const Logo = ({ isMenuOpen, isWhite, onNavigate }: LogoProps) => {
    const { pathname } = useLocation();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
        // Leave new-tab clicks to the browser.
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }
        if (pathname !== '/') return;

        event.preventDefault();
        scrollToTop();
        document.getElementById('main')?.focus({ preventScroll: true });
    };

    return (
        <Link
            to='/'
            aria-label='ijji labs home'
            onClick={handleClick}
            className={clsx(
                'whitespace-nowrap text-3xl md:text-4xl font-extrabold font-newsreader transition-all duration-300 ease-in-out',
                isMenuOpen || isWhite ? 'text-white' : 'text-ui-background-secondary',
            )}
        >
            ijji labs
        </Link>
    );
};
