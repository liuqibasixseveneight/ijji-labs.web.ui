import { clsx } from 'clsx';

import { COLUMNS, type DeletionRequest } from '../../deletionRequests.ts';
import { useMove } from './useMove.ts';

type StatusSelectProps = {
    request: DeletionRequest;
    /** Visible above the select, or (compact, on cards) only for screen readers. */
    label: string;
    compact?: boolean;
    className?: string;
};

/**
 * Moves a request to another column: the way to do it on a phone, or with a keyboard, where
 * dragging is awkward. Closing one (Done, Rejected) asks first; saying no leaves it as it was.
 */
export const StatusSelect = ({ request, label, compact = false, className }: StatusSelectProps) => {
    const { move, pending } = useMove();
    const busy = pending?.id === request.id;
    const status = busy ? pending.status : request.status;

    return (
        <label className={clsx('flex flex-col gap-1.5', className)}>
            <span
                className={
                    compact
                        ? 'sr-only'
                        : 'text-xs font-bold tracking-widest uppercase text-neutral-600'
                }
            >
                {label}
            </span>
            <select
                value={status}
                disabled={busy}
                onChange={(event) =>
                    move(request.id, event.target.value as DeletionRequest['status'], {
                        from: status,
                    })
                }
                className={clsx(
                    'w-full rounded-lg border border-neutral-300 bg-white font-semibold text-neutral-900 cursor-pointer disabled:opacity-60',
                    compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2.5 text-base',
                )}
            >
                {COLUMNS.map((column) => (
                    <option key={column.status} value={column.status}>
                        {column.title}
                    </option>
                ))}
            </select>
        </label>
    );
};
