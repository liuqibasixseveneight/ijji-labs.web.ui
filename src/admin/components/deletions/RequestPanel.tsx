import { useEffect, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

import { Button } from '../../../components/ui/atoms/Button/Button.tsx';
import { FieldWrapper } from '../../../components/ui/atoms/FieldWrapper/FieldWrapper.tsx';
import { TextareaInput } from '../../../components/ui/atoms/TextareaInput/TextareaInput.tsx';
import { FormError } from '../../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { site } from '../../../content/site.ts';
import {
    confirmEmail,
    daysLeft,
    deletionSql,
    doneEmail,
    OPEN,
    STATUS_LABELS,
    type DeletionRequest,
    type EmailTemplate,
} from '../../deletionRequests.ts';
import { CopyButton } from '../CopyButton.tsx';
import { DaysLeft } from './Board.tsx';
import { STEPS } from './steps.ts';
import { useMove } from './useMove.ts';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const actionLink =
    'inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-100';
const plainButton =
    'rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 cursor-pointer';

/** Write an email in the mail app (from support@), or copy its text. */
const EmailActions = ({ template, label }: { template: EmailTemplate; label: string }) => (
    <div className='flex flex-wrap items-center gap-2'>
        <a href={template.href} className={actionLink}>
            {label}
        </a>
        <CopyButton text={template.body} label='Copy the message' showLabel />
    </div>
);

type StepProps = {
    number: number;
    done: boolean;
    current: boolean;
    children?: ReactNode;
};

/** One step: its number (or a tick), title, what to do, and the buttons to do it. */
const Step = ({ number, done, current, children }: StepProps) => {
    const step = STEPS[number - 1];
    return (
        <li className='flex gap-4' aria-current={current ? 'step' : undefined}>
            <span
                aria-hidden='true'
                className={clsx(
                    'shrink-0 w-8 h-8 rounded-full font-extrabold flex items-center justify-center',
                    done && 'bg-green-100 text-green-800',
                    current && 'bg-ui-background-primary text-brand-primary',
                    !done && !current && 'bg-neutral-100 text-neutral-600',
                )}
            >
                {done ? '✓' : number}
            </span>
            <div className='flex flex-col gap-2 pb-6 min-w-0 flex-1'>
                <h4 className='font-bold'>
                    {step.title}
                    {done && <span className='sr-only'> (done)</span>}
                </h4>
                <p className='text-sm text-neutral-600'>{step.description}</p>
                {children}
            </div>
        </li>
    );
};

type RequestPanelProps = {
    request: DeletionRequest;
    now: number;
    sqlEditorUrl: string;
    onClose: () => void;
};

/**
 * One request, worked through step by step: the actions for each step are right there (write
 * or copy the emails, open the SQL editor and copy the SQL), with the moves to make as you go,
 * notes and the history. Esc or Close shuts it.
 */
export const RequestPanel = ({ request, now, sqlEditorUrl, onClose }: RequestPanelProps) => {
    const { move, pending, error } = useMove();
    const [note, setNote] = useState('');
    const headingRef = useRef<HTMLHeadingElement>(null);
    const headingId = `panel-${request.id}`;

    const status = pending?.id === request.id ? pending.status : request.status;
    const isOpen = OPEN.includes(status);
    const busy = pending?.id === request.id;

    useEffect(() => {
        headingRef.current?.focus();
    }, [request.id]);

    useEffect(() => {
        const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', close);
        return () => document.removeEventListener('keydown', close);
    }, [onClose]);

    const go = (to: DeletionRequest['status']) => {
        if (move(request.id, to, { note, from: status })) setNote('');
    };

    const confirm = confirmEmail(request, site.deletionTime);
    const finished = doneEmail(request);
    const step1Done = status !== 'new';
    const allDone = status === 'done';

    return (
        <aside
            aria-labelledby={headingId}
            className='fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-white shadow-2xl border-l border-neutral-200 overflow-y-auto [--focus-ring:var(--color-ui-background-primary)]'
        >
            <div className='sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                    <p className='text-xs font-bold tracking-widest uppercase text-neutral-600'>
                        {request.appName} · {STATUS_LABELS[status]}
                    </p>
                    <h2
                        id={headingId}
                        ref={headingRef}
                        tabIndex={-1}
                        className='text-xl font-extrabold break-all outline-none'
                    >
                        {request.email ?? 'Email removed'}
                    </h2>
                </div>
                <button type='button' onClick={onClose} className={plainButton}>
                    Close
                </button>
            </div>

            <div className='px-6 py-6 flex flex-col gap-8'>
                <div className='flex flex-wrap items-center gap-3'>
                    {request.email && (
                        <CopyButton text={request.email} label='Copy email address' showLabel />
                    )}
                    {isOpen && <DaysLeft days={daysLeft(request, now)} />}
                </div>

                <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm'>
                    <dt className='font-semibold'>Received</dt>
                    <dd>{dateFormat.format(request.receivedAt)}</dd>
                    <dt className='font-semibold'>Due by</dt>
                    <dd>{dateFormat.format(request.dueAt)}</dd>
                    {request.closedAt && !isOpen && (
                        <>
                            <dt className='font-semibold'>Closed</dt>
                            <dd>{dateFormat.format(request.closedAt)}</dd>
                        </>
                    )}
                    <dt className='font-semibold'>Reason</dt>
                    <dd className='whitespace-pre-wrap'>{request.reason ?? 'None given'}</dd>
                </dl>

                {error && <FormError title='Not saved' message={error} />}

                {status === 'rejected' ? (
                    <section className='bg-neutral-100 rounded-xl p-4 flex flex-col gap-3'>
                        <h3 className='font-bold'>Rejected</h3>
                        <p className='text-sm text-neutral-600'>
                            Nothing more to do. Reopen it if they get back in touch.
                        </p>
                        <button
                            type='button'
                            disabled={busy}
                            onClick={() => go('awaiting-confirmation')}
                            className={clsx(plainButton, 'self-start')}
                        >
                            Reopen
                        </button>
                    </section>
                ) : (
                    <section aria-labelledby='steps-title'>
                        <h3 id='steps-title' className='text-lg font-bold mb-4'>
                            {allDone ? 'All done' : 'Steps'}
                        </h3>
                        <ol>
                            <Step number={1} done={step1Done} current={!step1Done}>
                                {!allDone && request.email && (
                                    <>
                                        <EmailActions template={confirm} label='Write the email' />
                                        {status === 'new' && (
                                            <Button
                                                size='compact'
                                                label='I’ve emailed them'
                                                className='self-start'
                                                disabled={busy}
                                                onClick={() => go('awaiting-confirmation')}
                                            />
                                        )}
                                    </>
                                )}
                            </Step>

                            <Step number={2} done={allDone} current={step1Done && !allDone}>
                                {status === 'awaiting-confirmation' && (
                                    <p className='text-sm'>
                                        No reply, or it wasn’t them?{' '}
                                        <button
                                            type='button'
                                            disabled={busy}
                                            onClick={() => go('rejected')}
                                            className='font-semibold underline underline-offset-4 cursor-pointer'
                                        >
                                            Reject it
                                        </button>
                                    </p>
                                )}
                            </Step>

                            <Step number={3} done={allDone} current={false}>
                                {status === 'awaiting-confirmation' && request.email && (
                                    <>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <a
                                                href={sqlEditorUrl}
                                                target='_blank'
                                                rel='noreferrer'
                                                className={actionLink}
                                            >
                                                Open the SQL editor
                                                <span className='sr-only'>
                                                    {' '}
                                                    (opens Supabase in a new tab)
                                                </span>
                                            </a>
                                            <CopyButton
                                                text={deletionSql(request.email)}
                                                label='Copy the SQL'
                                                showLabel
                                            />
                                        </div>
                                        <details className='text-sm'>
                                            <summary className='cursor-pointer font-semibold'>
                                                Show the SQL
                                            </summary>
                                            <pre className='mt-2 overflow-x-auto bg-neutral-900 text-neutral-100 rounded-lg p-3 text-xs'>
                                                {deletionSql(request.email)}
                                            </pre>
                                        </details>
                                    </>
                                )}
                            </Step>

                            <Step number={4} done={allDone} current={false}>
                                {status === 'awaiting-confirmation' && request.email && (
                                    <>
                                        <EmailActions template={finished} label='Write the email' />
                                        <Button
                                            size='compact'
                                            label='Mark as done'
                                            className='self-start'
                                            disabled={busy}
                                            onClick={() => go('done')}
                                        />
                                    </>
                                )}
                            </Step>
                        </ol>
                        {allDone && (
                            <button
                                type='button'
                                disabled={busy}
                                onClick={() => go('awaiting-confirmation')}
                                className={plainButton}
                            >
                                Reopen
                            </button>
                        )}
                    </section>
                )}

                <section aria-labelledby='notes-title' className='flex flex-col gap-4'>
                    <h3 id='notes-title' className='text-lg font-bold'>
                        Notes and history
                    </h3>
                    <ol className='flex flex-col gap-2 text-sm border-l-2 border-neutral-200 pl-4'>
                        {request.history.map((step, index) => (
                            <li key={index}>
                                <span className='font-semibold'>{dateFormat.format(step.at)}</span>{' '}
                                · {STATUS_LABELS[step.status]}
                                {step.note && (
                                    <span className='block text-neutral-700'>{step.note}</span>
                                )}
                            </li>
                        ))}
                    </ol>

                    <FieldWrapper label='Add a note'>
                        <TextareaInput
                            rows={2}
                            maxLength={500}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                        />
                    </FieldWrapper>
                    <button
                        type='button'
                        disabled={busy || !note.trim()}
                        onClick={() => go(status)}
                        className={clsx(
                            plainButton,
                            'self-end disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        Save note
                    </button>
                </section>
            </div>
        </aside>
    );
};
