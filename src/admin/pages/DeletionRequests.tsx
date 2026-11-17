import { Navigate, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { Board } from '../components/deletions/Board.tsx';
import { ProcessSteps } from '../components/deletions/ProcessSteps.tsx';
import { useMove } from '../components/deletions/useMove.ts';
import { daysLeft, describeDaysLeft, OPEN } from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';

/**
 * Web requests to delete an app account, as a board: one column per status, a card per
 * request. Each card opens its own page (/deletion-requests/<id>) with the steps.
 */
export const DeletionRequests = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const [params] = useSearchParams();
    const { error } = useMove();

    // Old links (?request=<id>, from when details opened in a side panel) go to its page.
    const linked = params.get('request');
    if (linked) return <Navigate to={adminPaths.deletionRequest(linked)} replace />;

    const open = deletions?.requests.filter((request) => OPEN.includes(request.status)) ?? [];
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
                    <Board requests={deletions.requests} now={deletions.now} />
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
