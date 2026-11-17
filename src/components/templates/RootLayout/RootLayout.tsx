import { Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import { siteGraph } from '../../../content/structuredData.ts';
import { Footer, Navbar, StructuredData, type Palette } from '../../ui';
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
            <a
                href='#main'
                className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-primary focus:text-ui-background-primary focus:px-4 focus:py-2 focus:font-bold'
            >
                Skip to content
            </a>

            <StructuredData data={siteGraph()} />
            <Navbar isGradientDark={isGradientDark} />

            <main
                id='main'
                tabIndex={-1}
                className='flex-1 flex flex-col -mt-20 md:-mt-[clamp(80px,10vh,100px)]'
            >
                <Outlet context={outletContext} />
            </main>

            <Footer />
        </div>
    );
};
