import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

import { RollingText } from '../RollingText/RollingText.tsx';
import type { NavMenuItemProps } from './types.ts';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

/**
 * One row of the menu: number, label, a short description and an arrow. In the site's
 * style: the label is heavy and rolls on hover or keyboard focus, as the buttons do, with a
 * yellow copy rolling in; a yellow line sweeps along the row's foot; the arrow lifts. The
 * page you're on stays yellow. As the menu opens, the rows slide in one after another.
 */
export const NavMenuItem = ({
    link,
    index,
    isMenuOpen,
    onHover,
    onLeave,
    setIsOpen,
}: NavMenuItemProps) => (
    <li
        style={{ transitionDelay: isMenuOpen ? `${150 + index * 60}ms` : '0ms' }}
        className={clsx(
            'relative border-t border-white/5 transition-[translate,opacity] duration-700',
            EASE,
            isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        )}
    >
        <NavLink
            to={link.to}
            end
            onClick={() => setIsOpen(false)}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            // Keyboard focus only: opening the menu focuses its first link, which shouldn't
            // look hovered to someone using a mouse.
            onFocus={(event) => {
                if (event.currentTarget.matches(':focus-visible')) onHover();
            }}
            onBlur={onLeave}
            className='group relative flex items-center gap-4 md:gap-8 py-2.5 md:py-4 [@media(max-height:500px)]:py-1 text-white'
        >
            {({ isActive }) => (
                <>
                    <span
                        className={clsx(
                            'shrink-0 w-6 text-xs font-medium tabular-nums transition-colors duration-300',
                            'group-hover:text-brand-primary group-focus-visible:text-brand-primary',
                            isActive ? 'text-brand-primary' : 'text-white/60',
                        )}
                    >
                        {link.num}
                    </span>

                    <span className='flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-6'>
                        <span
                            className={clsx(
                                // Sized by whichever is tighter, the height (six rows must fit) or the width.
                                'font-extrabold leading-[1.05] tracking-tight text-[clamp(1.75rem,min(6.5vh,11vw),4.5rem)]',
                                isActive && 'text-brand-primary',
                            )}
                        >
                            <RollingText rollInClassName='text-brand-primary'>
                                {link.label}
                            </RollingText>
                        </span>

                        <span
                            className={clsx(
                                // Under the label on phones, so hidden when the screen is short; beside it from md.
                                'mt-1 md:mt-0 md:ml-auto text-xs uppercase tracking-widest transition-colors duration-300 max-md:[@media(max-height:740px)]:hidden',
                                'group-hover:text-white group-focus-visible:text-white',
                                isActive ? 'text-brand-primary' : 'text-white/60',
                            )}
                        >
                            {isActive ? 'You’re here' : link.description}
                        </span>
                    </span>

                    <svg
                        viewBox='0 0 14 14'
                        fill='none'
                        aria-hidden='true'
                        className={clsx(
                            'hidden sm:block shrink-0 w-3.5 h-3.5 transition-[translate,color] duration-500',
                            EASE,
                            'group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-brand-primary',
                            'group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:text-brand-primary',
                            isActive ? 'text-brand-primary' : 'text-white/60',
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

                    {/* The yellow line along the row's foot, sweeping in from the left. */}
                    <span
                        aria-hidden='true'
                        className={clsx(
                            'absolute left-0 right-0 -bottom-px h-px bg-brand-primary origin-left scale-x-0 transition-transform duration-700',
                            EASE,
                            'group-hover:scale-x-100 group-focus-visible:scale-x-100',
                        )}
                    />
                </>
            )}
        </NavLink>
    </li>
);
