import { Link, NavLink, Outlet, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { signOut } from '../api.ts';
import { OPEN } from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';

const navLink = ({ isActive }: { isActive: boolean }) =>
    clsx(
        'flex items-center gap-2 py-3 border-b-2 text-sm font-semibold',
        isActive
            ? 'border-brand-primary text-white'
            : 'border-transparent text-neutral-400 hover:text-white',
    );

/** The dashboard's frame: a header with sign-out and the sections, and the page. */
export const AdminLayout = () => {
    const navigate = useNavigate();
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const openCount = deletions?.requests.filter((r) => OPEN.includes(r.status)).length ?? 0;

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
                    {/* The site's logo (as in its navbar), with "admin" beside it. */}
                    <Link
                        to={adminPaths.overview}
                        className='flex items-baseline gap-2 whitespace-nowrap'
                    >
                        <span className='text-3xl md:text-4xl font-extrabold font-newsreader text-white'>
                            ijji labs
                        </span>{' '}
                        <span className='text-lg md:text-xl font-bold text-brand-primary'>
                            admin
                        </span>
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

                <nav aria-label='Admin' className='max-w-380 mx-auto px-6 md:px-8'>
                    <ul className='flex gap-6'>
                        <li>
                            <NavLink to={adminPaths.overview} end className={navLink}>
                                Overview
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={adminPaths.deletionRequests} className={navLink}>
                                Deletion requests
                                {/* The spaces keep it "Deletion requests 2 open" for screen readers. */}
                                {openCount > 0 && ' '}
                                {openCount > 0 && (
                                    <span className='bg-brand-primary text-ui-background-primary rounded-full px-2 text-xs font-bold'>
                                        {openCount} <span className='sr-only'>open</span>
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </header>

            <main id='main' tabIndex={-1} className='flex-1 outline-none'>
                <Outlet />
            </main>
        </div>
    );
};
