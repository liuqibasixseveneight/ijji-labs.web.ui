import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { site } from '../../../../content/site.ts';
import { Logo, RollingText } from '../../atoms';
import { footerLinks, legalLinks } from './footerLinks.ts';

/**
 * The footer's hover line: a thin yellow line along the text's foot that sweeps in from the
 * left on hover or keyboard focus (and stays, on the page you're on). Put it on the link, or
 * on the text inside one marked `group`: `group-hover:` only matches inside the group, so both
 * are here.
 */
const underline =
    'relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-brand-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100';

/** A column's heading: small, spaced capitals, as the site's eyebrows. */
const ColumnHeading = ({ children }: { children: string }) => (
    <h2 className='text-xs font-medium uppercase tracking-widest text-white/60 mb-5'>{children}</h2>
);

/**
 * Every link in the footer's columns: one size and one style, white at 70% turning yellow and
 * rolling on hover or focus; the page you're on stays yellow. `context` is hidden text before
 * the label ("IJJI Tracker: Privacy"), so the name contains what it shows (WCAG 2.5.3).
 */
const FooterLink = ({
    to,
    context,
    children,
}: {
    to: string;
    context?: string;
    children: string;
}) => (
    <li>
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                clsx(
                    'group inline-block text-sm transition-colors duration-300 hover:text-brand-primary focus-visible:text-brand-primary',
                    underline,
                    isActive ? 'text-brand-primary after:scale-x-100' : 'text-white/70',
                )
            }
        >
            {/* The space outside the hidden span: a trailing space inside it is dropped. */}
            {context && <span className='sr-only'>{context}:</span>}
            {context && ' '}
            <RollingText>{children}</RollingText>
        </NavLink>
    </li>
);

const Column = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className='min-w-0'>
        <ColumnHeading>{title}</ColumnHeading>
        <ul className='flex flex-col items-start gap-3'>{children}</ul>
    </div>
);

/**
 * Back to the top of the page, and to its main content for keyboard and screen reader users
 * (focus goes there too). Smooth unless the device asks for less motion.
 */
const BackToTop = () => (
    <button
        type='button'
        onClick={() => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            document.getElementById('main')?.focus({ preventScroll: true });
        }}
        className='group inline-flex items-center gap-2 text-white/70 hover:text-brand-primary focus-visible:text-brand-primary transition-colors cursor-pointer'
    >
        <span className={underline}>
            <RollingText>Back to top</RollingText>
        </span>
        <svg
            aria-hidden='true'
            viewBox='0 0 14 14'
            fill='none'
            className='w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5'
        >
            <path
                d='M7 13V1M7 1L1.5 6.5M7 1l5.5 5.5'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    </button>
);

/**
 * The site's footer, kept calm: an invitation to get in touch, then one row of columns (the
 * studio, its pages, and each set of policies, one click from any page for the stores'
 * reviewers), then the copyright and Back to top. One link style, one heading style.
 */
export const Footer = () => (
    <footer className='bg-ui-background-secondary text-white' data-print='hide'>
        <div className='max-w-380 px-6 md:px-8 mx-auto'>
            <section
                aria-labelledby='footer-invitation'
                className='flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between py-16 md:py-20 border-b border-white/10'
            >
                <div className='max-w-2xl'>
                    <h2
                        id='footer-invitation'
                        className='text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]'
                    >
                        Have a website in mind?
                    </h2>
                    <p className='mt-4 text-white/60'>
                        Tell us about your business or project, and what you need. We reply{' '}
                        {site.replyTime}.
                    </p>
                </div>
                {/* The footer's own link style, larger: white, turning yellow and rolling. */}
                <a
                    href={`mailto:${site.studioEmail}`}
                    className='group self-start lg:self-auto inline-flex items-center gap-2.5 max-w-full text-xl md:text-2xl font-bold text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors'
                >
                    {/* Not clipped: overflow would hide the line below the text. */}
                    <span className={clsx(underline, '[overflow-wrap:anywhere]')}>
                        <RollingText>{site.studioEmail}</RollingText>
                    </span>
                    <svg
                        aria-hidden='true'
                        viewBox='0 0 14 14'
                        fill='none'
                        className='shrink-0 w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5'
                    >
                        <path
                            d='M1 13L13 1M13 1H4M13 1V10'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </a>
            </section>

            <div className='grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-4 lg:grid-cols-12 border-b border-white/10'>
                <div className='col-span-2 md:col-span-4 lg:col-span-5 flex flex-col items-start gap-4'>
                    <Logo isWhite />
                    <p className='text-sm text-white/60 max-w-xs'>{site.tagline}</p>
                    <p className='text-sm text-white/60'>{site.location}</p>
                </div>

                <nav aria-label='Footer' className='lg:col-span-2 lg:col-start-7'>
                    <Column title='Studio'>
                        {footerLinks.map((link) => (
                            <FooterLink key={link.to} to={link.to}>
                                {link.text}
                            </FooterLink>
                        ))}
                    </Column>
                </nav>

                {/* Each set of policies in its own column: the studio's, then each app's. */}
                <nav
                    aria-label='Legal'
                    className='md:col-span-2 lg:col-span-4 grid gap-12 md:grid-cols-2 md:gap-6'
                >
                    {legalLinks.map(({ group, links }) => (
                        <Column key={group} title={group}>
                            {links.map((link) => (
                                <FooterLink key={link.to} to={link.to} context={group}>
                                    {link.text}
                                </FooterLink>
                            ))}
                        </Column>
                    ))}
                </nav>
            </div>

            <div className='flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between py-6 text-sm text-white/60'>
                <p>&copy; 2026 {site.name}</p>
                <BackToTop />
            </div>
        </div>
    </footer>
);
