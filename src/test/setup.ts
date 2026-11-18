import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// findBy… and waitFor wait up to 3 s, not 1: whole pages render slower when every test file
// runs at once under coverage. A test still fails if what it waits for never comes.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

// The rest only applies to tests in jsdom; the Netlify function's tests run in node.
if (typeof window !== 'undefined') {
    // jsdom has no layout or scrolling; the navbar and scroll indicator call these.
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    Element.prototype.scrollIntoView = vi.fn();

    // jsdom has no IntersectionObserver; FluidGradient waits on one before starting WebGL,
    // so in tests it never starts and the placeholder gradient stays up.
    class IntersectionObserverStub {
        // Kept so a test can play the observer and say something is on screen.
        callback: IntersectionObserverCallback;
        constructor(callback: IntersectionObserverCallback) {
            this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    }

    window.IntersectionObserver =
        IntersectionObserverStub as unknown as typeof window.IntersectionObserver;
}
