import type { FormEvent } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { FieldWrapper } from '../../components/ui/atoms/FieldWrapper/FieldWrapper.tsx';
import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { SelectInput } from '../../components/ui/atoms/SelectInput/SelectInput.tsx';
import { TextareaInput } from '../../components/ui/atoms/TextareaInput/TextareaInput.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { site } from '../../content/site.ts';
import { AdminMeta } from '../components/AdminMeta.tsx';
import {
    daysLeft,
    describeDaysLeft,
    OPEN,
    STATUS_LABELS,
    STATUSES,
    urgency,
    type DeletionRequest,
} from '../deletionRequests.ts';
import type { AdminData } from '../routes.tsx';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const URGENCY = {
    fine: 'bg-neutral-100 text-neutral-800',
    soon: 'bg-amber-100 text-amber-900',
    urgent: 'bg-red-100 text-red-800',
} as const;

/** How long is left, coloured by how urgent it is. */
const DaysLeft = ({ days }: { days: number }) => (
    <span className={clsx('px-3 py-1 rounded-full text-sm font-bold', URGENCY[urgency(days)])}>
        {describeDaysLeft(days)}
    </span>
);

/** One open request: who, when, why, what's happened, and the status to move it to. */
const OpenRequest = ({ request, now }: { request: DeletionRequest; now: number }) => {
    const fetcher = useFetcher<{ saved?: string; error?: string }>();
    const titleId = `request-${request.id}`;

    const confirmClose = (event: FormEvent<HTMLFormElement>) => {
        const status = new FormData(event.currentTarget).get('status');
        if (
            (status === 'done' || status === 'rejected') &&
            !window.confirm(`Mark this request as ${STATUS_LABELS[status].toLowerCase()}?`)
        ) {
            event.preventDefault();
        }
    };

    return (
        <li className='border border-neutral-200 p-6 flex flex-col gap-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <h3 id={titleId} className='text-lg font-bold break-all'>
                    {request.email}
                </h3>
                <DaysLeft days={daysLeft(request, now)} />
            </div>

            <dl className='grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr] text-neutral-700'>
                <dt className='font-semibold'>App</dt>
                <dd>{request.appName}</dd>
                <dt className='font-semibold'>Received</dt>
                <dd>{dateFormat.format(request.receivedAt)}</dd>
                <dt className='font-semibold'>Due by</dt>
                <dd>{dateFormat.format(request.dueAt)}</dd>
                <dt className='font-semibold'>Status</dt>
                <dd>{STATUS_LABELS[request.status]}</dd>
                <dt className='font-semibold'>Reason</dt>
                <dd className='whitespace-pre-wrap'>{request.reason ?? 'None given'}</dd>
            </dl>

            {request.history.some((step) => step.note) && (
                <ul className='text-sm text-neutral-600 flex flex-col gap-1'>
                    {request.history
                        .filter((step) => step.note)
                        .map((step) => (
                            <li key={step.at}>
                                {dateFormat.format(step.at)}, {STATUS_LABELS[step.status]}:{' '}
                                {step.note}
                            </li>
                        ))}
                </ul>
            )}

            {/* Keyed by status, so the note clears once a change is saved. */}
            <fetcher.Form
                key={request.status}
                method='post'
                onSubmit={confirmClose}
                aria-labelledby={titleId}
                className='grid gap-4 md:grid-cols-[16rem_1fr_auto] md:items-end border-t border-neutral-200 pt-4'
            >
                <input type='hidden' name='id' value={request.id} />
                <FieldWrapper label='Move to'>
                    <SelectInput name='status' defaultValue={request.status}>
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                            </option>
                        ))}
                    </SelectInput>
                </FieldWrapper>
                <FieldWrapper label='Note (optional)'>
                    <TextareaInput name='note' rows={1} maxLength={500} />
                </FieldWrapper>

                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        size='compact'
                        label='Save'
                        isLoading={fetcher.state !== 'idle'}
                    />
                </div>

                {fetcher.data?.error && (
                    <div className='md:col-span-3'>
                        <FormError title='Not saved' message={fetcher.data.error} />
                    </div>
                )}
            </fetcher.Form>
        </li>
    );
};

/**
 * Web requests to delete an app account: the open ones to deal with, soonest due first, and
 * the closed ones underneath (their email and reason go 30 days after closing).
 */
export const DeletionRequests = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;

    const open = deletions?.requests.filter((r) => OPEN.includes(r.status)) ?? [];
    const closed = deletions?.requests.filter((r) => !OPEN.includes(r.status)) ?? [];
    const now = deletions?.now ?? 0;

    return (
        <>
            <AdminMeta title='Deletion requests' />

            <Section tone='light' spacing='md' labelledBy='deletion-requests-title'>
                <h1 id='deletion-requests-title' className='text-4xl font-extrabold mb-4'>
                    Deletion requests
                </h1>
                <p className='text-neutral-600 max-w-2xl mb-10'>
                    For each request: reply from {site.email} to check it came from that address,
                    delete the account in the production Supabase project once they confirm, then
                    tell them it’s done. We’ve promised to finish {site.deletionTime}.
                </p>

                {!deletions ? (
                    <FormError
                        title='Couldn’t load the requests'
                        message='Reload the page to try again. Requests still arrive by email.'
                    />
                ) : (
                    <>
                        <h2 className='text-2xl font-bold mb-4'>Open ({open.length})</h2>
                        {open.length ? (
                            <ul className='flex flex-col gap-4 mb-12'>
                                {open.map((request) => (
                                    <OpenRequest key={request.id} request={request} now={now} />
                                ))}
                            </ul>
                        ) : (
                            <p className='text-neutral-600 mb-12'>Nothing to do.</p>
                        )}

                        <h2 className='text-2xl font-bold mb-4'>Closed ({closed.length})</h2>
                        {closed.length ? (
                            <ul className='flex flex-col divide-y divide-neutral-200 border-y border-neutral-200'>
                                {closed.map((request) => (
                                    <li
                                        key={request.id}
                                        className='py-3 flex flex-wrap gap-x-6 gap-y-1 text-neutral-700'
                                    >
                                        <span className='font-semibold break-all'>
                                            {request.email ?? 'Email removed'}
                                        </span>
                                        <span>{request.appName}</span>
                                        <span>
                                            {STATUS_LABELS[request.status]}{' '}
                                            {request.closedAt &&
                                                dateFormat.format(request.closedAt)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='text-neutral-600'>None yet.</p>
                        )}
                    </>
                )}
            </Section>
        </>
    );
};
