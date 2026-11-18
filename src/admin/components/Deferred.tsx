import { Suspense, type ReactNode } from 'react';
import { Await } from 'react-router-dom';

import type { Loaded } from '../cache.ts';

/**
 * A page's data as it arrives. The page is drawn at once: with the data if it's fresh, with
 * the last data and `updating` while newer loads, or with `fallback` (a skeleton) the first
 * time. `children` gets null when it couldn't be loaded.
 */
export const Deferred = <T,>({
    loaded,
    fallback,
    children,
}: {
    loaded: Loaded<T>;
    fallback: ReactNode;
    children: (data: T | null, state: { updating: boolean }) => ReactNode;
}) => (
    <Suspense
        fallback={loaded.stale !== null ? children(loaded.stale, { updating: true }) : fallback}
    >
        <Await resolve={loaded.data} errorElement={children(null, { updating: false })}>
            {(data: T | null) => children(data, { updating: false })}
        </Await>
    </Suspense>
);
