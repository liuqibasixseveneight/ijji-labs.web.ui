import { useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import {
    COLUMNS,
    daysLeft,
    describeDaysLeft,
    OPEN,
    sortRequests,
    urgency,
    type DeletionRequest,
    type Sort,
    type Status,
} from '../../deletionRequests.ts';
import { adminPaths } from '../../paths.ts';
import { CopyButton } from '../CopyButton.tsx';
import { secondaryAction } from '../styles.ts';
import { Email } from '../Email.tsx';
import { StatusSelect } from './StatusSelect.tsx';
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
            'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap',
            URGENCY[urgency(days)],
        )}
    >
        {describeDaysLeft(days)}
    </span>
);

type CardProps = { request: DeletionRequest; now: number; moving: boolean };

/**
 * One request on the board: who, how long is left, when it came in, and the column it's in.
 * The email is a link to its page, stretched over the whole card, so a tap anywhere opens
 * it; the copy button and the column select sit above that link and work on their own.
 */
const Card = ({ request, now, moving }: CardProps) => {
    const open = OPEN.includes(request.status);
    const urgent = open && urgency(daysLeft(request, now)) === 'urgent';

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
                'group relative bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-shadow hover:shadow-md',
                urgent ? 'border-red-300' : 'border-neutral-200 hover:border-neutral-400',
                moving && 'opacity-60',
            )}
        >
            {urgent && (
                <span
                    aria-hidden='true'
                    className='absolute left-0 inset-y-3 w-1 rounded-r bg-red-500'
                />
            )}

            <div className='flex items-center justify-between gap-2'>
                <span className='text-xs font-bold uppercase tracking-widest text-neutral-600'>
                    {request.appName}
                </span>
                {open && <DaysLeft days={daysLeft(request, now)} />}
            </div>

            <div className='flex items-start gap-2'>
                <h3 className='min-w-0 flex-1'>
                    <Link
                        to={adminPaths.deletionRequest(request.id)}
                        draggable={false}
                        className="font-bold group-hover:underline underline-offset-4 after:absolute after:inset-0 after:content-['']"
                    >
                        {request.email ? <Email address={request.email} /> : 'Email removed'}
                    </Link>
                </h3>
                {request.email && (
                    <CopyButton
                        text={request.email}
                        label='Copy email address'
                        className='relative z-10 shrink-0'
                    />
                )}
            </div>

            <p className='text-sm text-neutral-600'>
                {open ? 'Received' : 'Closed'}{' '}
                {dateFormat.format(
                    open ? request.receivedAt : (request.closedAt ?? request.receivedAt),
                )}
                {moving && <span className='font-semibold'> · Moving…</span>}
            </p>

            <div className='relative z-10 flex items-center gap-2 pt-3 border-t border-neutral-100'>
                <StatusSelect
                    request={request}
                    label={`Move ${request.email ?? 'this request'} to`}
                    compact
                    className='flex-1'
                />
                <span
                    aria-hidden='true'
                    className='pointer-events-none text-sm font-semibold text-neutral-800 whitespace-nowrap'
                >
                    Open →
                </span>
            </div>
        </li>
    );
};

/** How many cards a column shows at first, and how many more each "Show more" adds. */
export const PAGE_SIZE = 20;

type BoardProps = {
    requests: DeletionRequest[];
    now: number;
    sort: Sort;
    /** A search is on: only columns with matches show. */
    searching?: boolean;
};

/**
 * Every request as a card in its status's column, in the chosen order (closed columns latest
 * first), the first {@link PAGE_SIZE} of each with a button to show more. Move a card with its column select (any
 * screen), or drag it to another column on a desktop; closing one asks first. On phones the
 * columns sit side by side and swipe, each nearly the screen's width.
 */
export const Board = ({ requests, now, sort, searching = false }: BoardProps) => {
    const { move, pending } = useMove();
    const [over, setOver] = useState<Status | null>(null);
    // How many cards each column shows: a long column doesn't render hundreds at once.
    const [limits, setLimits] = useState<Partial<Record<Status, number>>>({});

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

    if (searching && !shown.length) {
        return (
            <p className='rounded-2xl bg-neutral-100 p-6 text-neutral-700'>
                No requests match that search.
            </p>
        );
    }

    return (
        <div className='-mx-6 px-6 md:mx-0 md:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-2 xl:grid-cols-4 md:items-start md:overflow-visible md:pb-0'>
            {COLUMNS.map((column) => {
                const cards = sortRequests(
                    shown.filter((request) => request.status === column.status),
                    sort,
                );
                const limit = limits[column.status] ?? PAGE_SIZE;
                const visible = cards.slice(0, limit);
                const hidden = cards.length - visible.length;
                const headingId = `column-${column.status}`;

                // While searching, only columns with matches: on a phone, the results are
                // right there rather than in a column you'd have to swipe to.
                if (searching && !cards.length) return null;

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
                            'snap-start shrink-0 w-[85%] sm:w-80 md:w-auto rounded-2xl p-3 min-h-40 flex flex-col gap-3 transition-colors',
                            over === column.status
                                ? 'bg-brand-primary/30 ring-2 ring-brand-primary'
                                : 'bg-neutral-100',
                        )}
                    >
                        <header className='px-1'>
                            <h2 id={headingId} className='font-bold flex items-center gap-2'>
                                {column.title}
                                <span className='text-sm font-semibold text-neutral-700 bg-white rounded-full px-2'>
                                    {cards.length}
                                </span>
                            </h2>
                            <p className='text-xs text-neutral-600 mt-1'>{column.hint}</p>
                        </header>

                        {cards.length ? (
                            <ul className='flex flex-col gap-3'>
                                {visible.map((request) => (
                                    <Card
                                        key={request.id}
                                        request={request}
                                        now={now}
                                        moving={pending?.id === request.id}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <p className='text-sm text-neutral-600 px-1 py-4'>None.</p>
                        )}

                        {hidden > 0 && (
                            <button
                                type='button'
                                onClick={() =>
                                    setLimits((current) => ({
                                        ...current,
                                        [column.status]: limit + PAGE_SIZE,
                                    }))
                                }
                                className={secondaryAction}
                            >
                                Show {Math.min(hidden, PAGE_SIZE)} more{' '}
                                <span className='font-normal text-neutral-600'>
                                    ({hidden} hidden)
                                </span>
                            </button>
                        )}
                    </section>
                );
            })}
        </div>
    );
};
