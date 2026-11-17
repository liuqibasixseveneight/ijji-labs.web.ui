import { useCallback, useRef } from 'react';
import { useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { Board } from '../components/deletions/Board.tsx';
import { ProcessSteps } from '../components/deletions/ProcessSteps.tsx';
import { RequestPanel } from '../components/deletions/RequestPanel.tsx';
import { useMove } from '../components/deletions/useMove.ts';
import { daysLeft, describeDaysLeft, OPEN } from '../deletionRequests.ts';
import type { AdminData } from '../routes.tsx';

/**
 * Web requests to delete an app account, as a board: one column per status, a card per
 * request. Opening a card (`?request=<id>`, so Back closes it) shows its steps and actions.
 */
export const DeletionRequests = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const [params, setParams] = useSearchParams();
    const { error } = useMove();
    const opener = useRef<HTMLElement | null>(null);

    const selectedId = params.get('request');
    const selected = deletions?.requests.find((request) => request.id === selectedId);

    const openRequest = (id: string) => {
        opener.current = document.activeElement as HTMLElement | null;
        setParams({ request: id });
    };

    const close = useCallback(() => {
        setParams({}, { replace: true });
        // Back to the card it was opened from, wherever it's moved to on the board.
        requestAnimationFrame(() => {
            const card = selectedId
                ? document.querySelector<HTMLElement>(`[data-request="${selectedId}"] h3 button`)
                : null;
            (card ?? opener.current)?.focus();
        });
    }, [setParams, selectedId]);

    const open = deletions?.requests.filter((request) => OPEN.includes(request.status)) ?? [];
    const next = open.length
        ? Math.min(...open.map((request) => daysLeft(request, deletions!.now)))
        : null;

    return (
        <>
            <AdminMeta title='Deletion requests' />

            <Section tone='light' spacing='md' labelledBy='deletion-requests-title'>
                <div className='flex flex-wrap items-baseline justify-between gap-4 mb-8'>
                    <h1 id='deletion-requests-title' className='text-4xl font-extrabold'>
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

                {!selected && error && <FormError title='Not saved' message={error} />}

                {deletions ? (
                    <Board requests={deletions.requests} now={deletions.now} onOpen={openRequest} />
                ) : (
                    <FormError
                        title='Couldn’t load the requests'
                        message='Reload the page to try again. Requests still arrive by email.'
                    />
                )}
            </Section>

            {selected && deletions && (
                <>
                    <div
                        aria-hidden='true'
                        onClick={close}
                        className='fixed inset-0 z-30 bg-ui-background-primary/40'
                    />
                    <RequestPanel
                        request={selected}
                        now={deletions.now}
                        sqlEditorUrl={deletions.sqlEditorUrl}
                        onClose={close}
                    />
                </>
            )}
        </>
    );
};
