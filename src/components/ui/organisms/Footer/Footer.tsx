import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { site } from '../../../../content/site.ts';
import { Logo, RollingText } from '../../atoms';
import { markerLink, markerLinkRollIn } from '../../atoms/TextLink/markerLink.ts';
import { footerLinks, legalLinks } from './footerLinks.ts';

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
                    isActive ? 'text-brand-primary' : 'text-white/70',
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
        <RollingText>Back to top</RollingText>
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
                        Tell us about your business and what you need. We reply {site.replyTime}.
                    </p>
                </div>
                <a
                    href={`mailto:${site.email}`}
                    className={clsx(
                        markerLink('dark'),
                        'group self-start lg:self-auto px-1 -mx-1 text-xl md:text-2xl font-bold [--marker-rest:0.14] [overflow-wrap:anywhere]',
                    )}
                >
                    <RollingText rollInClassName={markerLinkRollIn}>{site.email}</RollingText>
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
