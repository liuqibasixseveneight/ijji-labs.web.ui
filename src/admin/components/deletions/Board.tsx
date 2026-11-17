import { useState, type DragEvent } from 'react';
import { clsx } from 'clsx';

import {
    COLUMNS,
    daysLeft,
    describeDaysLeft,
    OPEN,
    urgency,
    type DeletionRequest,
    type Status,
} from '../../deletionRequests.ts';
import { CopyButton } from '../CopyButton.tsx';
import { useMove } from './useMove.ts';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

const URGENCY = {
    fine: 'bg-neutral-100 text-neutral-800',
    soon: 'bg-amber-100 text-amber-900',
    urgent: 'bg-red-100 text-red-800',
} as const;

/** How long is left, coloured by how urgent it is. */
export const DaysLeft = ({ days }: { days: number }) => (
    <span
        className={clsx(
            'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold',
            URGENCY[urgency(days)],
        )}
    >
        {describeDaysLeft(days)}
    </span>
);

type CardProps = {
    request: DeletionRequest;
    now: number;
    moving: boolean;
    onOpen: (id: string) => void;
};

/**
 * One request on the board: who, how long is left, and when it came in. Click anywhere on it
 * to see its details and steps (the email is the button, stretched over the card), or drag it
 * to another column.
 */
const Card = ({ request, now, moving, onOpen }: CardProps) => {
    const open = OPEN.includes(request.status);

    const startDrag = (event: DragEvent<HTMLLIElement>) => {
        event.dataTransfer.setData('text/plain', request.id);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <li
            draggable
            onDragStart={startDrag}
            data-request={request.id}
            className={clsx(
                'group relative bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm cursor-pointer active:cursor-grabbing transition-shadow hover:shadow-md hover:border-neutral-400',
                moving && 'opacity-60',
                open &&
                    urgency(daysLeft(request, now)) === 'urgent' &&
                    'border-l-4 border-l-red-500',
            )}
        >
            <div className='flex items-center justify-between gap-2 text-xs text-neutral-600'>
                <span className='font-semibold uppercase tracking-widest'>{request.appName}</span>
                {open && <DaysLeft days={daysLeft(request, now)} />}
            </div>

            <div className='flex items-start gap-2'>
                <h3 className='min-w-0 flex-1'>
                    <button
                        type='button'
                        onClick={() => onOpen(request.id)}
                        className="text-left font-bold [overflow-wrap:anywhere] group-hover:underline underline-offset-4 cursor-pointer after:absolute after:inset-0 after:content-['']"
                    >
                        {request.email ?? 'Email removed'}
                    </button>
                </h3>
                {request.email && (
                    <CopyButton
                        text={request.email}
                        label='Copy email address'
                        className='relative z-10 shrink-0'
                    />
                )}
            </div>

            <div className='flex items-center justify-between gap-2 text-sm text-neutral-600'>
                <p>
                    {open ? 'Received' : 'Closed'}{' '}
                    {dateFormat.format(
                        open ? request.receivedAt : (request.closedAt ?? request.receivedAt),
                    )}
                    {moving && <span className='font-semibold'> · Moving…</span>}
                </p>
                <span
                    aria-hidden='true'
                    className='pointer-events-none font-semibold text-neutral-800 group-hover:translate-x-0.5 transition-transform'
                >
                    Details →
                </span>
            </div>
        </li>
    );
};

type BoardProps = { requests: DeletionRequest[]; now: number; onOpen: (id: string) => void };

/**
 * Every request as a card in its status's column. Drag a card to another column to move it
 * (closing one asks first), or open it to work through its steps; the panel has the same
 * moves for keyboards and touch screens.
 */
export const Board = ({ requests, now, onOpen }: BoardProps) => {
    const { move, pending } = useMove();
    const [over, setOver] = useState<Status | null>(null);

    // A move in flight shows straight away in its new column.
    const shown = requests.map((request) =>
        pending?.id === request.id ? { ...request, status: pending.status } : request,
    );

    const drop = (status: Status) => (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setOver(null);
        const id = event.dataTransfer.getData('text/plain');
        const request = requests.find((r) => r.id === id);
        if (request && request.status !== status) move(id, status, { from: request.status });
    };

    return (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-start'>
            {COLUMNS.map((column) => {
                const cards = shown.filter((request) => request.status === column.status);
                const headingId = `column-${column.status}`;

                return (
                    <section
                        key={column.status}
                        aria-labelledby={headingId}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            setOver(column.status);
                        }}
                        onDragLeave={() => setOver(null)}
                        onDrop={drop(column.status)}
                        className={clsx(
                            'rounded-2xl p-3 min-h-40 flex flex-col gap-3 transition-colors',
                            over === column.status
                                ? 'bg-brand-primary/30 ring-2 ring-brand-primary'
                                : 'bg-neutral-100',
                        )}
                    >
                        <header className='px-1'>
                            <h2 id={headingId} className='font-bold flex items-center gap-2'>
                                {column.title}
                                <span className='text-sm font-semibold text-neutral-600 bg-white rounded-full px-2'>
                                    {cards.length}
                                </span>
                            </h2>
                            <p className='text-xs text-neutral-600 mt-1'>{column.hint}</p>
                        </header>

                        {cards.length ? (
                            <ul className='flex flex-col gap-3'>
                                {cards.map((request) => (
                                    <Card
                                        key={request.id}
                                        request={request}
                                        now={now}
                                        moving={pending?.id === request.id}
                                        onOpen={onOpen}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <p className='text-sm text-neutral-600 px-1 py-4'>None.</p>
                        )}
                    </section>
                );
            })}
        </div>
    );
};
