import { Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import { Footer, Navbar } from '../../ui';
import type { Palette } from '../../ui/organisms/FluidGradient/utils';

const DARK_HERO_ROUTES: string[] = ['/about', '/services', '/projects', '/contact'];

export const RootLayout = () => {
    const [isPaletteDark, setIsPaletteDark] = useState(false);
    const { pathname } = useLocation();

    const isGradientDark = pathname === '/' && isPaletteDark;
    const isNavInitiallyWhite = isGradientDark || DARK_HERO_ROUTES.includes(pathname);

    const onPathnameChange = useEffectEvent((path: string) => {
        if (path !== '/') setIsPaletteDark(false);
    });

    useEffect(() => {
        onPathnameChange(pathname);
    }, [pathname]);

    const handlePaletteChange = useCallback((palette: Palette) => {
        setIsPaletteDark(palette.isDark);
    }, []);

    return (
        <div className='flex flex-col min-h-screen relative'>
            <Navbar isGradientDark={isNavInitiallyWhite} />

            <main className='flex-1 flex flex-col -mt-16 md:-mt-[clamp(64px,10vh,100px)]'>
                <Outlet context={{ isGradientDark, handlePaletteChange }} />
            </main>

            <Footer />
        </div>
    );
};
