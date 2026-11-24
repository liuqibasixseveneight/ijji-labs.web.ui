import { clsx } from 'clsx';
import { useEffect, useState, type CSSProperties } from 'react';

import { scrollToTop } from '../../../../lib/smoothScroll.ts';
import { useHydrated } from '../../../../lib/useHydrated.ts';
import { RollingText } from '../RollingText/RollingText.tsx';
import type { BackToTopProps } from './types.ts';

// The cut corner, as the site's Button draws it: a custom property, so hover can deepen it.
const CUT_STYLE = {
    '--cut-rest': '10px',
    clipPath: 'polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%)',
} as CSSProperties;

/**
 * The site's yellow, corner-cut button, small, in the bottom-right corner: it glides back to
 * the top of the page,
 * and moves focus there too, so the next Tab starts at the top. "Back to top" shows from
 * tablets up; on a phone it's the arrow alone (the words stay for screen readers). It shows
 * once the first
 * screen has scrolled away. On a phone, where it would sit over the content's own controls,
 * it steps aside while scrolling down and comes back on the way up. It also steps aside
 * while the footer is on screen, which has its own Back to top. Hidden, it's inert. Browser-only: it isn't in the pre-rendered HTML.
 */
export const BackToTop = ({ focusTargetId = 'main' }: BackToTopProps) => {
    const isHydrated = useHydrated();
    const [isShown, setIsShown] = useState(false);
    const [isFooterInView, setIsFooterInView] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        const update = () => {
            const y = window.scrollY;
            const isPastFirstScreen = y > window.innerHeight * 0.8;
            const isWide = window.matchMedia?.('(min-width: 768px)').matches ?? true;
            if (isWide || y < lastY - 4 || !isPastFirstScreen) {
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

    // The footer has its own Back to top, so this one steps aside while any of it shows.
    useEffect(() => {
        const footer = document.querySelector('footer');
        if (!footer || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(([entry]) =>
            setIsFooterInView(entry.isIntersecting),
        );
        observer.observe(footer);
        return () => observer.disconnect();
    }, []);

    if (!isHydrated) return null;

    const isVisible = isShown && !isFooterInView;

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
                    onClick={handleClick}
                    inert={!isVisible}
                    className={clsx(
                        'group pointer-events-auto rounded-l-4xl cursor-pointer',
                        'transition-[opacity,translate] duration-300',
                        // The shape below is clipped, which would clip a focus ring too, so the
                        // ring is the button's: dark in a white halo, to show on any section.
                        'focus-visible:outline-ui-background-primary focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_6px_white]',
                        isVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-2 pointer-events-none',
                    )}
                >
                    {/* As the site's Button: yellow, rounded on the left, the top-right corner
                        cut, deepening on hover or focus, and the label rolling up. */}
                    <span
                        style={CUT_STYLE}
                        className={clsx(
                            'flex items-center justify-center gap-2 h-11 px-4 md:pl-5 md:pr-6 rounded-l-4xl',
                            'bg-brand-primary text-ui-background-primary',
                            'whitespace-nowrap font-extrabold tracking-widest uppercase text-xs',
                            '[--cut:var(--cut-rest)] group-hover:[--cut:calc(var(--cut-rest)*1.8)] group-focus-visible:[--cut:calc(var(--cut-rest)*1.8)]',
                            '[transition:clip-path_500ms_cubic-bezier(0.22,1,0.36,1),scale_150ms_ease] group-active:scale-[0.97]',
                        )}
                    >
                        <svg
                            viewBox='0 0 24 24'
                            width='16'
                            height='16'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.25'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden
                            className='shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5'
                        >
                            <path d='M12 19V5' />
                            <path d='m5 12 7-7 7 7' />
                        </svg>
                        <span className='sr-only md:not-sr-only'>
                            <RollingText>Back to top</RollingText>
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
};
