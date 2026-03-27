import { Outlet } from 'react-router-dom';

import { Footer, Navbar } from '../../ui';
import { PearlescentBackground } from '../PearlescentBackground';

export const RootLayout = () => {
    return (
        <div className={'min-h-screen flex flex-col text-neutral-100'}>
            <PearlescentBackground>
                <div className={'flex-1 flex flex-col min-h-0'}>
                    <Navbar />
                    <Outlet />
                </div>
            </PearlescentBackground>

            <Footer />
        </div>
    );
};
