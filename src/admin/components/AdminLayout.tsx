import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
    useNavigation,
    useRevalidator,
    useRouteLoaderData,
} from 'react-router-dom';
import { clsx } from 'clsx';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { signOut } from '../api.ts';
import { SignOutEverywhere } from './SignOutEverywhere.tsx';
import { prefetchOn } from '../data.ts';
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
    const navigation = useNavigation();
    const revalidator = useRevalidator();
    const busy = navigation.state !== 'idle' || revalidator.state !== 'idle';

    const leave = async () => {
        await signOut();
        navigate(adminPaths.signIn, { replace: true });
    };

    return (
        <div className='min-h-svh flex flex-col bg-white [--focus-ring:var(--color-ui-background-primary)]'>
            <a
                href='#main'
                className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-brand-primary text-ui-background-primary px-4 py-2 font-bold'
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

            <header className='bg-ui-background-primary text-white'>
                {/* One row at every width: on phones the logo is smaller, and "Sign out
                    everywhere" moves to the Overview. */}
                <div className='max-w-380 mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4'>
                    {/* The site's logo (as in its navbar), with "admin" beside it. */}
                    <Link
                        to={adminPaths.overview}
                        className='flex min-w-0 items-baseline gap-1.5 sm:gap-2 whitespace-nowrap'
                    >
                        <span className='text-2xl sm:text-3xl md:text-4xl font-extrabold font-newsreader text-white'>
                            ijji labs
                        </span>{' '}
                        <span className='text-base sm:text-lg md:text-xl font-bold text-brand-primary'>
                            admin
                        </span>
                    </Link>

                    <div className='flex shrink-0 items-center gap-4'>
                        <SignOutEverywhere className='hidden sm:inline text-neutral-400 hover:text-white' />
                        <Button size='compact' label='Sign out' onClick={leave} />
                    </div>
                </div>

                <nav aria-label='Admin' className='max-w-380 mx-auto px-4 sm:px-6 md:px-8'>
                    {/* Scrolls sideways if the links don't fit (the narrowest phones). */}
                    <ul className='flex gap-3 min-[360px]:gap-4 sm:gap-6 whitespace-nowrap overflow-x-auto [scrollbar-width:none]'>
                        <li>
                            <NavLink
                                to={adminPaths.overview}
                                end
                                {...prefetchOn(adminPaths.overview)}
                                className={navLink}
                            >
                                Overview
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={adminPaths.website}
                                {...prefetchOn(adminPaths.website)}
                                className={navLink}
                            >
                                Website
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={adminPaths.supabase}
                                {...prefetchOn(adminPaths.supabase)}
                                className={navLink}
                            >
                                Supabase
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={adminPaths.deletionRequests} className={navLink}>
                                {/* Shorter on phones, so the links fit one row. */}
                                <span className='sm:hidden'>Deletions</span>
                                <span className='hidden sm:inline'>Deletion requests</span>
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
