import { useState } from 'react';
import { Navigate, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { Board } from '../components/deletions/Board.tsx';
import { Toolbar } from '../components/deletions/Toolbar.tsx';
import { ProcessSteps } from '../components/deletions/ProcessSteps.tsx';
import { useMove } from '../components/deletions/useMove.ts';
import {
    daysLeft,
    describeDaysLeft,
    isSort,
    matches,
    OPEN,
    type Sort,
} from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';

/**
 * Web requests to delete an app account, as a board: one column per status, a card per
 * request. Each card opens its own page (/deletion-requests/<id>) with the steps. The search
 * and sort live in the address (`?q=…&sort=…`), so they survive a refresh, Back, and sharing.
 */
export const DeletionRequests = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const [params, setParams] = useSearchParams();
    const { error } = useMove();

    // What's typed lives here, so every keystroke shows at once; the address follows.
    const [query, setQuery] = useState(params.get('q') ?? '');
    const sortParam = params.get('sort');
    const sort: Sort = isSort(sortParam) ? sortParam : 'due';

    /** Updates one setting in the address, without a history entry per keystroke. */
    const setParam = (key: string, value: string, fallback = '') =>
        setParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (value && value !== fallback) next.set(key, value);
                else next.delete(key);
                return next;
            },
            { replace: true },
        );

    // Old links (?request=<id>, from when details opened in a side panel) go to its page.
    const linked = params.get('request');
    if (linked) return <Navigate to={adminPaths.deletionRequest(linked)} replace />;

    const all = deletions?.requests ?? [];
    const found = all.filter((request) => matches(request, query));
    const open = all.filter((request) => OPEN.includes(request.status));
    const next = open.length
        ? Math.min(...open.map((request) => daysLeft(request, deletions!.now)))
        : null;

    return (
        <>
            <AdminMeta title='Deletion requests' />

            <Section tone='light' spacing='md' labelledBy='deletion-requests-title'>
                <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-6'>
                    <h1
                        id='deletion-requests-title'
                        className='text-3xl sm:text-4xl font-extrabold'
                    >
                        Deletion requests
                    </h1>
                    {deletions && (
                        <p className='text-neutral-600 font-semibold'>
                            {open.length} open
                            {next !== null &&
                                ` · the next: ${describeDaysLeft(next).toLowerCase()}`}
                        </p>
                    )}
                </div>

                <ProcessSteps />

                {error && (
                    <div className='mb-6'>
                        <FormError title='Not saved' message={error} />
                    </div>
                )}

                {deletions ? (
                    <>
                        <Toolbar
                            query={query}
                            sort={sort}
                            shown={found.length}
                            total={all.length}
                            onQuery={(value) => {
                                setQuery(value);
                                setParam('q', value.trim() ? value : '');
                            }}
                            onSort={(value) => setParam('sort', value, 'due')}
                        />
                        {/* Keyed by the search, so each column starts at its first page again. */}
                        <Board
                            key={query}
                            requests={found}
                            now={deletions.now}
                            sort={sort}
                            searching={Boolean(query.trim())}
                        />
                    </>
                ) : (
                    <FormError
                        title='Couldn’t load the requests'
                        message='Reload the page to try again. Requests still arrive by email.'
                    />
                )}
            </Section>
        </>
    );
};
