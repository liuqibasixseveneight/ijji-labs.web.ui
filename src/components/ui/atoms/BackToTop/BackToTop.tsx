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
        <button
            type='button'
            aria-label='Back to top'
            onClick={handleClick}
            inert={!isShown}
            data-print='hide'
            className={clsx(
                'group fixed z-5 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-8 md:bottom-8',
                'flex items-center justify-center w-12 h-12 rounded-full cursor-pointer',
                'bg-brand-primary text-ui-background-primary border border-ui-background-primary',
                'shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-[opacity,translate] duration-300',
                // A dark ring inside a white halo, so focus shows on dark and light sections.
                'focus-visible:outline-ui-background-primary focus-visible:shadow-[0_0_0_7px_white]',
                isShown
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3 pointer-events-none',
            )}
        >
            <svg
                viewBox='0 0 24 24'
                width='20'
                height='20'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.25'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden
                className='transition-transform duration-300 group-hover:-translate-y-0.5'
            >
                <path d='M12 19V5' />
                <path d='m5 12 7-7 7 7' />
            </svg>
        </button>
    );
};
