import { useSyncExternalStore } from 'react';

/** The height last measured, and the width it was measured at. */
let measured: { width: number; height: number } | undefined;

const read = () => {
    // Measure only on first use or when the width changes (a rotation): the toolbars sliding
    // in and out change just the height, and the hero mustn't follow them mid-scroll.
    if (!measured || measured.width !== window.innerWidth) {
        measured = { width: window.innerWidth, height: window.innerHeight };
    }
    return measured.height;
};

const subscribe = (onChange: () => void) => {
    window.addEventListener('resize', onChange, { passive: true });
    return () => window.removeEventListener('resize', onChange);
};

/**
 * The height of the screen you can actually see when the page opens, in pixels, held steady
 * after that. CSS has no unit for it: `100svh` comes out taller than the visible area in
 * Chrome on iPhone (its bottom toolbar sits over the page), and `100dvh` changes as the
 * toolbars slide in and out while scrolling, so anything sized by it jumps. Measured once,
 * and again only when the width changes (a rotation), never mid-scroll.
 *
 * Undefined while pre-rendering and hydrating, so callers fall back to `100svh` until then.
 */
export const useScreenHeight = () => useSyncExternalStore(subscribe, read, () => undefined);

/** For tests: forget the last measurement, as a fresh page load would. */
export const resetScreenHeight = () => {
    measured = undefined;
};
