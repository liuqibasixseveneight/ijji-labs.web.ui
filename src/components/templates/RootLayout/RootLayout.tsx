import { Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import { Footer, Navbar, type Palette } from '../../ui';
import type { HomeContextProps } from '../../pages/Home/types.ts';

export const RootLayout = () => {
    const [isPaletteDark, setIsPaletteDark] = useState(false);
    const { pathname } = useLocation();

    // Only Home has the gradient; every other page has a dark navbar regardless.
    const isGradientDark = pathname === '/' && isPaletteDark;

    const onPathnameChange = useEffectEvent((path: string) => {
        if (path !== '/') setIsPaletteDark(false);
    });

    useEffect(() => {
        onPathnameChange(pathname);
    }, [pathname]);

    const handlePaletteChange = useCallback((palette: Palette) => {
        setIsPaletteDark(palette.isDark);
    }, []);

    const outletContext: HomeContextProps = { isGradientDark, handlePaletteChange };

    return (
        <div className='flex flex-col min-h-screen relative'>
            <Navbar isGradientDark={isGradientDark} />

            <main className='flex-1 flex flex-col -mt-16 md:-mt-[clamp(64px,10vh,100px)]'>
                <Outlet context={outletContext} />
            </main>

            <Footer />
        </div>
    );
};
