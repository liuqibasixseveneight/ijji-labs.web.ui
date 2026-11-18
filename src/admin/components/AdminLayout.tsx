import { Outlet, useNavigation, useRevalidator } from 'react-router-dom';
import { clsx } from 'clsx';

import { AdminNavbar } from './AdminNavbar.tsx';

/** The dashboard's frame: the navbar (as the site's), a loading bar, and the page. */
export const AdminLayout = () => {
    const navigation = useNavigation();
    const revalidator = useRevalidator();
    const busy = navigation.state !== 'idle' || revalidator.state !== 'idle';

    return (
        <div className='min-h-svh flex flex-col bg-white'>
            <a
                href='#main'
                className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-primary focus:text-ui-background-primary focus:px-4 focus:py-2 focus:font-bold'
            >
                Skip to content
            </a>

            {/* A thin bar along the top while a page or its data is on its way. */}
            <div
                aria-hidden='true'
                className={clsx(
                    'fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden transition-opacity duration-200',
                    busy ? 'opacity-100 delay-150' : 'opacity-0',
                )}
            >
                <div className='h-full w-1/3 bg-brand-primary animate-[admin-progress_1.1s_ease-in-out_infinite]' />
            </div>

            <AdminNavbar />

            <main id='main' tabIndex={-1} className='flex-1 outline-none'>
                <Outlet />
            </main>
        </div>
    );
};
