import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while pre-rendering and while hydrating that HTML, true once the app is running in
 * the browser. For things that should exist only for people using the page, not in the
 * pre-rendered HTML that search engines and AI crawlers read (e.g. the rolling labels'
 * second copy). Hydration still matches, because the first browser render returns false.
 */
export const useHydrated = () =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
