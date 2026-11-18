import type { ReactNode } from 'react';
import { clsx } from 'clsx';

import { Button } from '../../../components/ui/atoms/Button/Button.tsx';
import { site } from '../../../content/site.ts';
import {
    confirmEmail,
    deletionSql,
    doneEmail,
    type DeletionRequest,
    type EmailTemplate,
    type Status,
} from '../../deletionRequests.ts';
import { CopyButton } from '../CopyButton.tsx';
import { eyebrow, panel, secondaryAction } from '../styles.ts';
import { STEPS } from './steps.ts';

/** Write an email in the mail app (from support@), or copy its text. */
const EmailActions = ({ template }: { template: EmailTemplate }) => (
    <div className='flex flex-wrap items-center gap-2'>
        <a href={template.href} className={secondaryAction}>
            Write the email
        </a>
        <CopyButton text={template.body} label='Copy the message' showLabel />
    </div>
);

type StepProps = {
    number: 1 | 2 | 3 | 4;
    state: 'done' | 'current' | 'to-do';
    children?: ReactNode;
};

/** One step: its number (or a tick), what to do, and the buttons to do it. */
const Step = ({ number, state, children }: StepProps) => {
    const step = STEPS[number - 1];
    return (
        <li
            aria-current={state === 'current' ? 'step' : undefined}
            className={clsx(
                'flex gap-4 rounded-xl p-4',
                state === 'current' && 'bg-brand-primary/15 ring-1 ring-brand-primary',
            )}
        >
            <span
                aria-hidden='true'
                className={clsx(
                    'shrink-0 w-8 h-8 rounded-full font-extrabold flex items-center justify-center',
                    state === 'done' && 'bg-green-100 text-green-800',
                    state === 'current' && 'bg-ui-background-primary text-brand-primary',
                    state === 'to-do' && 'bg-neutral-100 text-neutral-600',
                )}
            >
                {state === 'done' ? '✓' : number}
            </span>
            <div className='flex flex-col gap-3 min-w-0 flex-1'>
                <div>
                    <h3 className='font-bold'>
                        {step.title}
                        {state === 'done' && <span className='sr-only'> (done)</span>}
                    </h3>
                    <p className='text-sm text-neutral-600'>{step.description}</p>
                </div>
                {children}
            </div>
        </li>
    );
};

type RequestStepsProps = {
    request: DeletionRequest;
    status: Status;
    sqlEditorUrl: string;
    busy: boolean;
    onMove: (status: Status) => void;
};

/**
 * The four steps for an open request, with what each needs right there: the emails to write
 * or copy, the SQL editor and the SQL, and the moves to make as you go. Steps 3 and 4 offer
 * their actions once the request is awaiting confirmation, so nothing's skipped by accident.
 */
export const RequestSteps = ({
    request,
    status,
    sqlEditorUrl,
    busy,
    onMove,
}: RequestStepsProps) => {
    const awaiting = status === 'awaiting-confirmation';
    const done = status === 'done';
    const email = request.email;

    return (
        <section aria-labelledby='steps-title' className={panel}>
            <h2 id='steps-title' className={clsx(eyebrow, 'mb-3')}>
                {done ? 'All done' : 'Steps'}
            </h2>
            <ol className='flex flex-col gap-2 -mx-4'>
                <Step number={1} state={status === 'new' ? 'current' : 'done'}>
                    {status === 'new' && email && (
                        <>
                            <EmailActions template={confirmEmail(request, site.deletionTime)} />
                            <Button
                                size='compact'
                                label='I’ve emailed them'
                                className='self-start'
                                disabled={busy}
                                onClick={() => onMove('awaiting-confirmation')}
                            />
                        </>
                    )}
                </Step>

                <Step number={2} state={done ? 'done' : awaiting ? 'current' : 'to-do'}>
                    {awaiting && (
                        <p className='text-sm'>
                            No reply, or it wasn’t them?{' '}
                            <button
                                type='button'
                                disabled={busy}
                                onClick={() => onMove('rejected')}
                                className='link-highlight link-marked cursor-pointer'
                            >
                                Reject it
                            </button>
                        </p>
                    )}
                </Step>

                <Step number={3} state={done ? 'done' : 'to-do'}>
                    {awaiting && email && (
                        <>
                            <div className='flex flex-wrap items-center gap-2'>
                                <a
                                    href={sqlEditorUrl}
                                    target='_blank'
                                    rel='noreferrer'
                                    className={secondaryAction}
                                >
                                    Open the SQL editor
                                    <span className='sr-only'> (opens Supabase in a new tab)</span>
                                </a>
                                <CopyButton
                                    text={deletionSql(email)}
                                    label='Copy the SQL'
                                    showLabel
                                />
                            </div>
                            <details className='text-sm'>
                                <summary className='cursor-pointer font-semibold'>
                                    Show the SQL
                                </summary>
                                <pre className='mt-2 overflow-x-auto bg-neutral-900 text-neutral-100 rounded-lg p-3 text-xs'>
                                    {deletionSql(email)}
                                </pre>
                            </details>
                        </>
                    )}
                </Step>

                <Step number={4} state={done ? 'done' : 'to-do'}>
                    {awaiting && email && (
                        <>
                            <EmailActions template={doneEmail(request)} />
                            <Button
                                size='compact'
                                label='Mark as done'
                                className='self-start'
                                disabled={busy}
                                onClick={() => onMove('done')}
                            />
                        </>
                    )}
                </Step>
            </ol>
        </section>
    );
};
