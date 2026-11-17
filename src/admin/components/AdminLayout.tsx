import { Link, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { signOut } from '../api.ts';

/** The dashboard's frame: a header with sign-out, and the page. */
export const AdminLayout = () => {
    const navigate = useNavigate();

    const leave = async (everywhere: boolean) => {
        await signOut({ everywhere });
        navigate('/sign-in', { replace: true });
    };

    return (
        <div className='min-h-svh flex flex-col bg-white [--focus-ring:var(--color-ui-background-primary)]'>
            <a
                href='#main'
                className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-brand-primary text-ui-background-primary px-4 py-2 font-bold'
            >
                Skip to content
            </a>

            <header className='bg-ui-background-primary text-white'>
                <div className='max-w-380 mx-auto flex flex-wrap items-center justify-between gap-4 px-6 md:px-8 py-4'>
                    <Link to='/' className='text-lg font-extrabold tracking-tight'>
                        ijji labs <span className='text-brand-primary'>admin</span>
                    </Link>

                    <div className='flex items-center gap-4'>
                        <button
                            type='button'
                            onClick={() => leave(true)}
                            className='text-sm text-neutral-400 hover:text-white underline-offset-4 hover:underline cursor-pointer'
                        >
                            Sign out everywhere
                        </button>
                        <Button size='compact' label='Sign out' onClick={() => leave(false)} />
                    </div>
                </div>
            </header>

            <main id='main' tabIndex={-1} className='flex-1 outline-none'>
                <Outlet />
            </main>
        </div>
    );
};
