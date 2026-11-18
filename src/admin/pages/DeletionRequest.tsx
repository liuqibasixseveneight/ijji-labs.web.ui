import { useState, type ReactNode } from 'react';
import { Link, useParams, useRouteLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { FieldWrapper } from '../../components/ui/atoms/FieldWrapper/FieldWrapper.tsx';
import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { TextareaInput } from '../../components/ui/atoms/TextareaInput/TextareaInput.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { CopyButton } from '../components/CopyButton.tsx';
import { Email } from '../components/Email.tsx';
import { DaysLeft } from '../components/deletions/Board.tsx';
import { RequestSteps } from '../components/deletions/RequestSteps.tsx';
import { StatusSelect } from '../components/deletions/StatusSelect.tsx';
import { useMove } from '../components/deletions/useMove.ts';
import { eyebrow, panel, secondaryAction } from '../components/styles.ts';
import {
    COLUMNS,
    daysLeft,
    OPEN,
    STATUS_LABELS,
    type DeletionRequest as Request,
    type Status,
} from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

const BackLink = () => (
    <Link
        to={adminPaths.deletionRequests}
        className='inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:underline underline-offset-4 mb-6'
    >
        <span aria-hidden='true'>←</span> All deletion requests
    </Link>
);

/** A label and its value, in a definition list. */
const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className='flex flex-col gap-1'>
        <dt className={eyebrow}>{label}</dt>
        <dd className='text-neutral-900'>{children}</dd>
    </div>
);

/** Who asked, and what about: the email (labelled, with copy) and their reason. */
const Requester = ({ request }: { request: Request }) => (
    <section aria-labelledby='requester-title' className={panel}>
        <h2 id='requester-title' className={clsx(eyebrow, 'mb-4')}>
            Requester
        </h2>
        <dl className='flex flex-col gap-5'>
            <Fact label='Email address'>
                {request.email ? (
                    <span className='flex flex-wrap items-center gap-3'>
                        <span className='text-lg font-bold'>
                            <Email address={request.email} />
                        </span>
                        <CopyButton text={request.email} label='Copy email address' showLabel />
                    </span>
                ) : (
                    <span className='text-neutral-600'>
                        Removed 30 days after the request closed.
                    </span>
                )}
            </Fact>
            <Fact label='App'>{request.appName}</Fact>
            <Fact label='Reason they gave'>
                <span className='whitespace-pre-wrap'>
                    {request.reason ?? (
                        <span className='text-neutral-600'>
                            {request.email ? 'None given.' : 'Removed with the email.'}
                        </span>
                    )}
                </span>
            </Fact>
        </dl>
    </section>
);

/** Where the request is: its column (to change it), the dates, and how long is left. */
const StatusCard = ({
    request,
    status,
    now,
}: {
    request: Request;
    status: Status;
    now: number;
}) => {
    const column = COLUMNS.find((c) => c.status === status)!;
    return (
        <section aria-labelledby='status-title' className={panel}>
            <h2 id='status-title' className={clsx(eyebrow, 'mb-4')}>
                Status
            </h2>
            {/* On phones the select is in the page header instead. */}
            <div className='hidden lg:block mb-5 pb-5 border-b border-neutral-200'>
                <StatusSelect request={request} label='Column' />
                <p className='text-sm text-neutral-600 mt-2'>{column.hint}</p>
            </div>
            <dl className='grid grid-cols-2 gap-4'>
                <Fact label='Received'>{dateFormat.format(request.receivedAt)}</Fact>
                <Fact label='Due by'>{dateFormat.format(request.dueAt)}</Fact>
                {request.closedAt && !OPEN.includes(status) && (
                    <Fact label='Closed'>{dateFormat.format(request.closedAt)}</Fact>
                )}
                {OPEN.includes(status) && (
                    <Fact label='Time left'>
                        <DaysLeft days={daysLeft(request, now)} />
                    </Fact>
                )}
            </dl>
        </section>
    );
};

/** Everything that's happened, newest first, and a box to add a note. */
const Notes = ({
    request,
    busy,
    onNote,
}: {
    request: Request;
    busy: boolean;
    onNote: (note: string) => void;
}) => {
    const [note, setNote] = useState('');
    return (
        <section aria-labelledby='notes-title' className={panel}>
            <h2 id='notes-title' className={clsx(eyebrow, 'mb-4')}>
                Notes and history
            </h2>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onNote(note);
                    setNote('');
                }}
                className='flex flex-col gap-3 mb-6'
            >
                <FieldWrapper label='Add a note'>
                    <TextareaInput
                        rows={2}
                        maxLength={500}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                    />
                </FieldWrapper>
                <button
                    type='submit'
                    disabled={busy || !note.trim()}
                    className={clsx(secondaryAction, 'self-end')}
                >
                    Save note
                </button>
            </form>
            <ol className='flex flex-col gap-4 border-l-2 border-neutral-200 pl-4'>
                {[...request.history].reverse().map((step, index) => (
                    <li key={index} className='text-sm'>
                        <span className='font-semibold'>{STATUS_LABELS[step.status]}</span>
                        <span className='text-neutral-600'>
                            {' '}
                            · {dateTimeFormat.format(step.at)}
                        </span>
                        {step.note && (
                            <span className='block mt-1 text-neutral-800 whitespace-pre-wrap'>
                                {step.note}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
};

/**
 * One deletion request on its own page: who asked, where it stands (and the column to move
 * it to), the steps with their actions, and the notes. Two columns on wide screens, one on
 * phones, in the order you'd work through it.
 */
export const DeletionRequest = () => {
    const { requestId } = useParams();
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const { move, pending, error } = useMove();
    const request = deletions?.requests.find((r) => r.id === requestId);

    if (!deletions || !request) {
        return (
            <>
                <AdminMeta title='Deletion request' />
                <Section tone='light' spacing='md' labelledBy='request-title'>
                    <BackLink />
                    <h1 id='request-title' className='text-3xl font-extrabold mb-4'>
                        {deletions ? 'Request not found' : 'Couldn’t load the request'}
                    </h1>
                    <p className='text-neutral-600'>
                        {deletions
                            ? 'It may have been deleted a year after it closed, as the privacy policy says.'
                            : 'Reload the page to try again.'}
                    </p>
                </Section>
            </>
        );
    }

    const busy = pending?.id === request.id;
    const status = busy ? pending.status : request.status;
    const go = (to: Status, note = '') => move(request.id, to, { note, from: status });

    return (
        <>
            <AdminMeta title={`Deletion request · ${request.email ?? request.appName}`} />

            <Section tone='light' spacing='md' labelledBy='request-title'>
                <BackLink />

                <header className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                    <div className='min-w-0'>
                        <p className={eyebrow}>
                            {request.appName} · {STATUS_LABELS[status]}
                        </p>
                        <h1
                            id='request-title'
                            className='text-3xl sm:text-4xl font-extrabold [overflow-wrap:anywhere]'
                        >
                            Deletion request
                        </h1>
                    </div>
                    {OPEN.includes(status) && <DaysLeft days={daysLeft(request, deletions.now)} />}
                    <StatusSelect request={request} label='Column' className='w-full lg:hidden' />
                </header>

                {error && (
                    <div className='mb-6'>
                        <FormError title='Not saved' message={error} />
                    </div>
                )}

                {/*
                  Two columns from lg: the request and its steps on the left; status and notes
                  on the right. On phones one column in that same order (the column select is
                  in the header there, so it's first to hand).
                */}
                <div className='flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start'>
                    <div className='flex flex-col gap-6'>
                        <div>
                            <Requester request={request} />
                        </div>
                        <div>
                            {status === 'rejected' ? (
                                <section className={panel}>
                                    <h2 className='font-bold mb-2'>Rejected</h2>
                                    <p className='text-sm text-neutral-600 mb-4'>
                                        Nothing more to do. Reopen it if they get back in touch.
                                    </p>
                                    <button
                                        type='button'
                                        disabled={busy}
                                        onClick={() => go('awaiting-confirmation')}
                                        className={secondaryAction}
                                    >
                                        Reopen
                                    </button>
                                </section>
                            ) : (
                                <RequestSteps
                                    request={request}
                                    status={status}
                                    sqlEditorUrl={deletions.sqlEditorUrl}
                                    busy={busy}
                                    onMove={(to) => go(to)}
                                />
                            )}
                        </div>
                    </div>
                    <div className='flex flex-col gap-6'>
                        <div>
                            <StatusCard request={request} status={status} now={deletions.now} />
                        </div>
                        <div>
                            <Notes
                                request={request}
                                busy={busy}
                                onNote={(note) => go(status, note)}
                            />
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
};
