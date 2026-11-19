import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { site } from '../../../../content/site.ts';
import { AppMark, Logo, NavbarLink, RollingText, StudioMark } from '../../atoms';
import { footerLinks, legalLinks } from './footerLinks.ts';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

/** A column's small heading: the studio's eyebrow style. */
const ColumnHeading = ({ children }: { children: string }) => (
    <h2 className='text-xs font-medium uppercase tracking-widest text-white/60 mb-5'>{children}</h2>
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
        className='group inline-flex items-center gap-2 text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors cursor-pointer'
    >
        <RollingText>Back to top</RollingText>
        <svg
            aria-hidden='true'
            viewBox='0 0 14 14'
            fill='none'
            className={clsx(
                'w-3 h-3 transition-transform duration-500 group-hover:-translate-y-1',
                EASE,
            )}
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
 * The site's footer, as a studio's: a closing invitation with the email in large type, then
 * the studio (logo and what we do), the pages, how to reach us and every policy (each app's
 * with its mark, one click from any page for the stores' reviewers), then the copyright and
 * Back to top, over the wordmark set large and faint.
 */
export const Footer = () => (
    <footer
        className='relative overflow-hidden bg-ui-background-secondary text-ui-text-secondary'
        data-print='hide'
    >
        <div className='relative max-w-380 px-6 md:px-8 mx-auto'>
            {/* The invitation: the one thing we'd like you to do next. */}
            <section
                aria-labelledby='footer-invitation'
                className='py-16 md:py-24 border-b border-white/10'
            >
                <h2
                    id='footer-invitation'
                    className='text-xs font-medium uppercase tracking-widest text-white/60 mb-5'
                >
                    Have a website in mind?
                </h2>
                <a
                    href={`mailto:${site.email}`}
                    className='group inline-flex items-center gap-3 md:gap-5 max-w-full text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors'
                >
                    <span className='overflow-hidden font-extrabold tracking-tight leading-[1.05] text-[clamp(1.6rem,7.5vw,5.5rem)] [overflow-wrap:anywhere]'>
                        <RollingText>{site.email}</RollingText>
                    </span>
                    <svg
                        aria-hidden='true'
                        viewBox='0 0 14 14'
                        fill='none'
                        className={clsx(
                            'shrink-0 w-5 h-5 md:w-9 md:h-9 transition-transform duration-500',
                            'group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1',
                            EASE,
                        )}
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
                <p className='mt-5 text-sm md:text-base text-white/60 max-w-xl'>
                    Tell us about your business and what you need. We reply {site.replyTime}.
                </p>
            </section>

            <div className='grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:py-16 md:grid-cols-3 lg:grid-cols-12 lg:gap-8 border-b border-white/10'>
                <div className='col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-start gap-4'>
                    <Logo isWhite />
                    <p className='text-sm text-white/60 max-w-xs'>{site.tagline}</p>
                </div>

                <nav aria-label='Footer' className='lg:col-span-2'>
                    <ColumnHeading>Studio</ColumnHeading>
                    <ul className='flex flex-col items-start gap-3.5'>
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

                <div className='min-w-0 lg:col-span-3'>
                    <ColumnHeading>Contact</ColumnHeading>
                    <address className='not-italic flex flex-col items-start gap-3.5 text-sm'>
                        <a
                            href={`mailto:${site.email}`}
                            className='group overflow-hidden max-w-full text-white hover:text-brand-primary focus-visible:text-brand-primary transition-colors [overflow-wrap:anywhere]'
                        >
                            <RollingText>{site.email}</RollingText>
                        </a>
                        <span className='text-white/60'>{site.location}</span>
                    </address>
                </div>

                <nav aria-label='Legal' className='col-span-2 md:col-span-1 lg:col-span-3'>
                    <ColumnHeading>Policies</ColumnHeading>
                    {/* A row per group: the studio's own policy, then each app's, each with its
                    mark, so a store reviewer finds them from any page. */}
                    <ul className='flex flex-col gap-5'>
                        {legalLinks.map(({ group, slug, links }) => (
                            <li key={group} className='group/row flex items-start gap-3'>
                                <span
                                    aria-hidden='true'
                                    className={clsx(
                                        'shrink-0 transition-transform duration-500 group-hover/row:-rotate-6 group-hover/row:scale-110',
                                        EASE,
                                    )}
                                >
                                    {slug ? <AppMark slug={slug} size='sm' /> : <StudioMark />}
                                </span>
                                <span className='flex flex-col gap-1.5 min-w-0'>
                                    <span className='text-xs font-medium uppercase tracking-widest text-white/60 transition-colors group-hover/row:text-white'>
                                        {group}
                                    </span>
                                    <ul className='flex flex-wrap gap-x-5 gap-y-1.5 text-sm'>
                                        {links.map((link) => (
                                            <li key={link.to}>
                                                {/* The group is hidden text, not an aria-label, so the
                                                link's name ("ijji labs: Privacy") contains what it
                                                shows (WCAG 2.5.3, label in name). */}
                                                <NavLink
                                                    to={link.to}
                                                    className={({ isActive }) =>
                                                        clsx(
                                                            'group relative inline-block transition-colors duration-300 hover:text-brand-primary',
                                                            'after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-brand-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100',
                                                            isActive &&
                                                                'text-brand-primary after:scale-x-100',
                                                        )
                                                    }
                                                >
                                                    <span className='sr-only'>{group}: </span>{' '}
                                                    <RollingText>{link.text}</RollingText>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </span>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className='flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between py-6 text-xs uppercase tracking-widest text-white/60'>
                <p>
                    &copy; 2026 {site.name}. Designed and built in {site.location.split(',')[0]}.
                </p>
                <BackToTop />
            </div>
        </div>

        {/* The wordmark, set large and faint, running off the foot of the page. Decoration, so
        it's drawn as generated content rather than text: no screen reader reads it, and a
        contrast check doesn't hold its deliberately low contrast against it. */}
        <div
            aria-hidden='true'
            className="pointer-events-none select-none font-newsreader font-extrabold leading-[0.75] tracking-tight whitespace-nowrap text-white/[0.04] text-[27vw] text-center -mb-[4vw] before:content-['ijji_labs']"
        />
    </footer>
);
