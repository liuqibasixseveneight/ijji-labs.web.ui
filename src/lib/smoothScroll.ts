import Lenis from 'lenis';

/**
 * The site's smooth scrolling (Lenis), shared by the public site and the admin dashboard so
 * both scroll the same way. Off when the device asks for less motion.
 */
export const startSmoothScroll = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
};
