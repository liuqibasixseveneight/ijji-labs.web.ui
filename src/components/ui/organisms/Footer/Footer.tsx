import { Link } from 'react-router-dom';

import { site } from '../../../../content/site.ts';
import { Logo, NavbarLink, RollingText } from '../../atoms';
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
                app's. From sm up the names line up in a column, with the links beside them. */}
                {legalLinks.map(({ group, links }) => (
                    <div
                        key={group}
                        className='flex flex-col sm:flex-row sm:items-baseline gap-x-8 gap-y-3 py-5'
                    >
                        <span className='sm:w-44 shrink-0 text-xs font-medium uppercase tracking-widest text-white/60'>
                            {group}
                        </span>
                        <ul className='flex flex-wrap gap-x-8 gap-y-2'>
                            {links.map((link) => (
                                <li key={link.to}>
                                    {/* The group is hidden text, not an aria-label, so the link's
                                    name ("ijji labs: Privacy") contains what it shows
                                    (WCAG 2.5.3, label in name). */}
                                    <Link
                                        to={link.to}
                                        className='group hover:text-brand-primary transition-colors'
                                    >
                                        <span className='sr-only'>{group}: </span>{' '}
                                        <RollingText>{link.text}</RollingText>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    </footer>
);
