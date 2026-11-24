import Lenis from 'lenis';
import type { MouseEvent } from 'react';

let lenis: Lenis | undefined;

/**
 * The site's smooth scrolling (Lenis), shared by the public site and the admin dashboard so
 * both scroll the same way. Off when the device asks for less motion.
 */
export const startSmoothScroll = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    const raf = (time: number) => {
        lenis?.raf(time);
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
};

/**
 * Ends any glide and tells Lenis where the page really is, so what comes next starts from
 * here. (Lenis keeps its own idea of the position: it misses jumps made while it was busy,
 * and mid-glide it can think it's still where it set off.)
 */
const resync = (instance: Lenis) => {
    instance.stop();
    instance.start();
};

/**
 * Puts a new page at its top, or at a section (`target`), at once. Through Lenis when it's
 * running, which also stops any glide still going: a plain window.scrollTo is ignored while
 * Lenis glides (say, the wheel's last flick when a link is clicked), and the glide would then
 * carry the new page down to where the old one was heading.
 */
export const jumpTo = (target?: HTMLElement) => {
    if (lenis) {
        resync(lenis);
        // Measure the page first: on a first load Lenis can still think it's empty, and would
        // clamp a section's position to 0.
        lenis.resize();
        lenis.scrollTo(target ?? 0, { immediate: true, force: true });
        return;
    }
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
};

/** Glides back to the top of the page (jumps, for people who ask for less motion). */
export const scrollToTop = () => {
    if (lenis) {
        resync(lenis);
        lenis.scrollTo(0);
        return;
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
};

/**
 * Click handler for an in-page link (`href='#our-story'`): glides to the section rather than
 * jumping, landing below the navbar (Lenis and the browser both honour `scroll-margin-top`).
 * Like a plain anchor it puts the hash in the address bar and moves focus to the section, so
 * the next Tab carries on from there. Modified clicks, and links whose target isn't on the
 * page, are left to the browser.
 */
export const scrollToHash = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }

    const hash = event.currentTarget.hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!target) return;

    event.preventDefault();

    if (lenis) {
        resync(lenis);
        lenis.scrollTo(target);
    } else {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        target.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    // Keep the router's state, so its history entry stays its own.
    window.history.replaceState(window.history.state, '', hash);

    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
};
