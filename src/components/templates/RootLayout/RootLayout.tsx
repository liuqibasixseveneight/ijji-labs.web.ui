import { Outlet } from 'react-router-dom';
import { useCallback, useState } from 'react';

import { Footer, Navbar } from '../../ui';
import type { Palette } from '../../ui/organisms/FluidGradient/utils';

export const RootLayout = () => {
    const [isGradientDark, setIsGradientDark] = useState(false);

    const handlePaletteChange = useCallback((palette: Palette) => {
        setIsGradientDark(palette.isDark);
    }, []);

    return (
        <div className='flex flex-col min-h-screen relative'>
            <Navbar isGradientDark={isGradientDark} />

            <main className='flex-1 flex flex-col -mt-[10vh]'>
                <Outlet context={{ isGradientDark, handlePaletteChange }} />
            </main>

            <Footer />
        </div>
    );
};
