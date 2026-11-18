import { useEffect } from 'react';
import { Link, useNavigate, useRouteLoaderData } from 'react-router-dom';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { HamburgerIcon } from '../../components/ui/atoms/HamburgerIcon/HamburgerIcon.tsx';
import type { NavMenuItemLink } from '../../components/ui/atoms/NavMenuItem/types.ts';
import { RollingText } from '../../components/ui/atoms/RollingText/RollingText.tsx';
import { NavMenu, useNavMenu } from '../../components/ui/molecules/NavMenu/index.ts';
import { signOut } from '../api.ts';
import { prefetchPage } from '../data.ts';
import { OPEN } from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';
import { SignOutEverywhere } from './SignOutEverywhere.tsx';

const MENU_ID = 'admin-menu';
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** The menu footer's links: white, turning yellow and rolling, as on the site's menu. */
const footerLink =
    'group overflow-hidden text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors cursor-pointer';

/**
 * The dashboard's wordmark, "ijji labs | admin": the site's logo, a thin rule, and "admin" set
 * the same way (Newsreader, the same size and weight) in yellow. The rule is drawn, not a
 * typed bar, so it sits at the letters' height; screen readers hear "ijji labs admin".
 */
export const AdminLogo = () => (
    <Link
        to={adminPaths.overview}
        className='inline-flex items-center gap-2.5 md:gap-3.5 whitespace-nowrap text-[1.625rem] min-[400px]:text-3xl md:text-4xl font-extrabold font-newsreader text-white'
    >
        ijji labs <span aria-hidden='true' className='w-0.5 h-[0.8em] rounded-full bg-white/40' />
        <span className='text-brand-primary'>admin</span>
    </Link>
);

/** The navbar's bar: the site's height, width and padding, always dark. */
const bar =
    'sticky top-0 left-0 w-full z-20 h-20 md:h-[clamp(80px,10vh,100px)] bg-ui-background-secondary';
const inner = 'flex items-center justify-between h-full w-full max-w-380 mx-auto px-6 md:px-8';

/** Before signing in: the same bar with just the wordmark. */
export const SignInNavbar = () => (
    <header className={bar}>
        <div className={inner}>
            <AdminLogo />
        </div>
    </header>
);

/**
 * The dashboard's navbar, built as the site's is: the wordmark, a yellow button (Sign out,
 * where the site has Get in touch) and the menu button, opening the same full-screen menu
 * with the dashboard's sections. Always dark: every admin page starts on white.
 */
export const AdminNavbar = () => {
    const { isOpen, setIsOpen, toggle, buttonRef } = useNavMenu();
    const navigate = useNavigate();
    const { me, deletions } = useRouteLoaderData('admin') as AdminData;
    const open = deletions?.requests.filter((r) => OPEN.includes(r.status)).length ?? 0;

    // Opening the menu shows intent to move: start loading the sections' data.
    useEffect(() => {
        if (!isOpen) return;
        prefetchPage(adminPaths.overview);
        prefetchPage(adminPaths.supabase);
    }, [isOpen]);

    const leave = async () => {
        await signOut();
        navigate(adminPaths.signIn, { replace: true });
    };

    const links: NavMenuItemLink[] = [
        { label: 'Overview', to: adminPaths.overview, num: '00', description: 'At a glance' },
        {
            label: 'Website',
            to: adminPaths.website,
            num: '01',
            description: 'Uptime, Lighthouse, deploys',
        },
        { label: 'Supabase', to: adminPaths.supabase, num: '02', description: 'Usage and health' },
        {
            label: 'IJJI Tracker',
            to: adminPaths.app,
            num: '03',
            description: 'Builds and submissions',
        },
        {
            label: 'Deletions',
            to: adminPaths.deletionRequests,
            num: '04',
            description: open ? `${open} open` : 'Nothing to do',
            end: false,
        },
    ];

    return (
        <>
            <nav aria-label='Admin' className={bar}>
                <div className={inner}>
                    <AdminLogo />

                    <div className='flex items-center gap-4 md:gap-10'>
                        {/* On phones it's in the menu, so the wordmark has room. */}
                        <Button
                            size='compact'
                            label='Sign out'
                            onClick={leave}
                            className='hidden sm:flex'
                        />
                        <div className='relative'>
                            <HamburgerIcon
                                ref={buttonRef}
                                isOpen={isOpen}
                                setIsOpen={toggle}
                                isWhite
                                controls={MENU_ID}
                            />
                            {/* Open deletion requests, on the menu button: they must be dealt with. */}
                            {open > 0 && !isOpen && (
                                <span
                                    aria-hidden='true'
                                    className='absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-brand-primary text-ui-background-primary text-xs font-bold tabular-nums pointer-events-none'
                                >
                                    {open}
                                </span>
                            )}
                        </div>
                        {open > 0 && (
                            <span className='sr-only'>
                                {open} {open === 1 ? 'deletion request' : 'deletion requests'} open
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            <NavMenu
                id={MENU_ID}
                label='Admin sections'
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                links={links}
                footer={
                    <>
                        <span>Signed in until {time.format(me.expiresAt)}</span>
                        <span className='flex flex-wrap gap-x-6 gap-y-2'>
                            <button type='button' onClick={leave} className={footerLink}>
                                <RollingText>Sign out</RollingText>
                            </button>
                            <SignOutEverywhere className={footerLink} />
                        </span>
                    </>
                }
            />
        </>
    );
};
