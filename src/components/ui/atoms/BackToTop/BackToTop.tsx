import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import { scrollToTop } from '../../../../lib/smoothScroll.ts';
import { useHydrated } from '../../../../lib/useHydrated.ts';
import type { BackToTopProps } from './types.ts';

/**
 * A small round button in the bottom-right corner that glides back to the top of the page,
 * and moves focus there too, so the next Tab starts at the top. It shows once the first
 * screen has scrolled away. On a phone, where it would sit over the content's own controls,
 * it steps aside while scrolling down and comes back on the way up or at the end of the page.
 * Hidden, it's inert. Browser-only: it isn't in the pre-rendered HTML.
 */
export const BackToTop = ({ focusTargetId = 'main' }: BackToTopProps) => {
    const isHydrated = useHydrated();
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        const update = () => {
            const y = window.scrollY;
            const isPastFirstScreen = y > window.innerHeight * 0.8;
            const isAtBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 8;
            const isWide = window.matchMedia?.('(min-width: 768px)').matches ?? true;
            if (isWide || y < lastY - 4 || isAtBottom || !isPastFirstScreen) {
                setIsShown(isPastFirstScreen);
            } else if (y > lastY + 4) {
                setIsShown(false);
            }
            lastY = y;
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    if (!isHydrated) return null;

    const handleClick = () => {
        scrollToTop();
        document.getElementById(focusTargetId)?.focus({ preventScroll: true });
    };

    return (
        // Fixed to the bottom of the screen, but inside the same width and gutters as the
        // content (Section's 'wide'), so the button lines up with the page's right edge.
        <div
            data-print='hide'
            className='fixed z-5 inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:bottom-8 pointer-events-none'
        >
            <div className='mx-auto w-full max-w-380 px-6 md:px-8 flex justify-end'>
                <button
                    type='button'
                    aria-label='Back to top'
                    onClick={handleClick}
                    inert={!isShown}
                    className={clsx(
                        // Quiet, as the page's badge links: dark, a hairline border, a pale arrow
                        // that brightens on hover. Dark, so it reads on dark and white sections.
                        'group flex items-center justify-center w-11 h-11 rounded-full cursor-pointer',
                        'bg-ui-background-primary border border-white/20 text-white/70',
                        'hover:border-white/50 hover:text-white transition-[opacity,translate,color,border-color] duration-300',
                        // The ring sits on the button's own dark edge, so it shows on white too.
                        'focus-visible:outline-offset-0',
                        isShown
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-2 pointer-events-none',
                    )}
                >
                    <svg
                        viewBox='0 0 24 24'
                        width='16'
                        height='16'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.75'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden
                        className='transition-transform duration-300 group-hover:-translate-y-0.5'
                    >
                        <path d='M12 19V5' />
                        <path d='m5 12 7-7 7 7' />
                    </svg>
                </button>
            </div>
        </div>
    );
};
