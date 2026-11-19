import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * The full-screen menu's behaviour, shared by the site's navbar and the admin dashboard's:
 * - A new page starts at the top (or at the section its link names, as in
 *   /projects#project-dedalus), with the menu closed.
 * - Esc closes the menu and puts focus back on the button that opened it.
 */
export const useNavMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const location = useLocation();
    const lastPathname = useRef(location.pathname);

    const handleRouteChange = useEffectEvent(() => {
        const target = location.hash && document.getElementById(location.hash.slice(1));

        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);

        // Close the menu only when the page has changed: on first load this runs too, and it
        // mustn't shut a menu opened in the moment before it did.
        if (lastPathname.current !== location.pathname) {
            lastPathname.current = location.pathname;
            setIsOpen(false);
        }
    });

    useEffect(() => {
        handleRouteChange();
    }, [location.pathname]);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setIsOpen(false);
            buttonRef.current?.focus();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    return { isOpen, setIsOpen, toggle: () => setIsOpen((open) => !open), buttonRef };
};
