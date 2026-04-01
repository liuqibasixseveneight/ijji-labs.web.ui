import { Outlet } from 'react-router-dom';

import { Footer, Navbar } from '../../ui';

export const RootLayout = () => {
    return (
        <div className='flex flex-col min-h-screen relative'>
            <Navbar />

            <main className='flex-1 flex flex-col -mt-[10vh]'>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};
