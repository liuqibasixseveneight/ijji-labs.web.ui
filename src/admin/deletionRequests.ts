// What a web request to delete an app account looks like, shared by the dashboard and the
// functions that keep them (netlify/shared/deletionRequests.ts). Plain TypeScript only.

export const STATUSES = ['new', 'awaiting-confirmation', 'done', 'rejected'] as const;
export type Status = (typeof STATUSES)[number];

/** Requests that still need something doing. */
export const OPEN: readonly Status[] = ['new', 'awaiting-confirmation'];

export const STATUS_LABELS: Record<Status, string> = {
    new: 'New',
    'awaiting-confirmation': 'Awaiting confirmation',
    done: 'Done',
    rejected: 'Rejected',
};

export type DeletionRequest = {
    id: string;
    /** The app's slug and name. */
    app: string;
    appName: string;
    /** Removed (null) 30 days after the request is closed. */
    email: string | null;
    reason: string | null;
    receivedAt: number;
    /** When it has to be done by. */
    dueAt: number;
    status: Status;
    closedAt?: number;
    history: { at: number; status: Status; note?: string }[];
};

export const DAY = 24 * 60 * 60 * 1000;

/** Whole days until a request is due (negative once it's overdue). */
export const daysLeft = (request: Pick<DeletionRequest, 'dueAt'>, now = Date.now()) =>
    Math.ceil((request.dueAt - now) / DAY);

/** "12 days left", "1 day left", "Due today", "3 days overdue". */
export const describeDaysLeft = (days: number) => {
    if (days === 0) return 'Due today';
    const plural = Math.abs(days) === 1 ? 'day' : 'days';
    return days < 0 ? `${-days} ${plural} overdue` : `${days} ${plural} left`;
};

/** How urgent a request is: fine, getting close (under 10 days), or urgent (under 3, or overdue). */
export const urgency = (days: number) => (days < 3 ? 'urgent' : days < 10 ? 'soon' : 'fine');
