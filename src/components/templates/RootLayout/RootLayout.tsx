import { Outlet } from 'react-router-dom';

import { Footer, Navbar } from '../../ui';

export const RootLayout = () => {
    return (
        <div className={'min-h-screen flex flex-col bg-ui-background-primary text-neutral-100'}>
            <Navbar />

            <div className={'flex-1 flex flex-col min-h-0'}>
                <Outlet />
            </div>

            <Footer />
        </div>
    );
};
