import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { site } from '../../../../content/site.ts';
import { AppMark, Logo, NavbarLink, RollingText, StudioMark } from '../../atoms';
import { footerLinks, legalLinks } from './footerLinks.ts';

export const Footer = () => (
    <footer className='bg-ui-background-secondary py-10' data-print='hide'>
        <div className='max-w-380 px-6 md:px-8 mx-auto flex flex-col gap-10'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
                <div className='flex flex-col items-start text-ui-text-secondary text-sm'>
                    <Logo isWhite />
                    <div className='uppercase mt-4 md:mt-2'>
                        &copy; 2026 {site.name}. All rights reserved.
                    </div>
                </div>

                <nav aria-label='Footer' className='flex justify-start md:justify-end mt-8 md:mt-0'>
                    <ul className='flex flex-wrap items-center gap-x-6 gap-y-4 md:gap-x-10'>
                        {footerLinks.map((item) => (
                            <NavbarLink
                                key={item.to}
                                text={item.text}
                                to={item.to}
                                className='text-sm text-ui-text-secondary'
                            />
                        ))}
                    </ul>
                </nav>
            </div>

            <nav
                aria-label='Legal'
                className='flex flex-col divide-y divide-white/5 border-y border-white/5 text-sm text-ui-text-secondary'
            >
                {/* One row per group, one under another: the studio's own policy, then each
                app's, each with its mark. From sm up the names line up in a column, with the
                links beside them. */}
                {legalLinks.map(({ group, slug, links }) => (
                    <div
                        key={group}
                        className='group/row flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-4 py-5'
                    >
                        <span className='sm:w-52 shrink-0 flex items-center gap-3'>
                            <span
                                aria-hidden='true'
                                className='transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:-rotate-6 group-hover/row:scale-110'
                            >
                                {slug ? <AppMark slug={slug} size='sm' /> : <StudioMark />}
                            </span>
                            <span className='text-xs font-medium uppercase tracking-widest text-white/60 transition-colors group-hover/row:text-white'>
                                {group}
                            </span>
                        </span>
                        <ul className='flex flex-wrap gap-x-8 gap-y-3'>
                            {links.map((link) => (
                                <li key={link.to}>
                                    {/* The group is hidden text, not an aria-label, so the link's
                                    name ("ijji labs: Privacy") contains what it shows
                                    (WCAG 2.5.3, label in name). */}
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            clsx(
                                                'group relative inline-block transition-colors duration-300 hover:text-brand-primary',
                                                'after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-brand-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100',
                                                isActive && 'text-brand-primary after:scale-x-100',
                                            )
                                        }
                                    >
                                        <span className='sr-only'>{group}: </span>{' '}
                                        <RollingText>{link.text}</RollingText>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    </footer>
);
