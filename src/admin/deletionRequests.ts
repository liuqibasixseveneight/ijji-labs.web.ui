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

/** The board's columns, in order. */
export const COLUMNS: { status: Status; title: string; hint: string }[] = [
    { status: 'new', title: 'New', hint: 'Email them to check it’s really them.' },
    {
        status: 'awaiting-confirmation',
        title: 'Awaiting confirmation',
        hint: 'Once they reply, delete the account and tell them.',
    },
    { status: 'done', title: 'Done', hint: 'Deleted, and they’ve been told.' },
    { status: 'rejected', title: 'Rejected', hint: 'No account, or never confirmed.' },
];

/** Moving a request to one of these asks first: it closes the request. */
export const isClosing = (status: Status) => !OPEN.includes(status);

/** A ready-to-send email: a mailto: link for the mail app, and the text to copy. */
export type EmailTemplate = { subject: string; body: string; href: string };

const email = (to: string, subject: string, body: string): EmailTemplate => ({
    subject,
    body,
    href: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
});

/** Step 1: asks the person to confirm the request came from them. */
export const confirmEmail = (request: DeletionRequest, deletionTime: string) =>
    email(
        request.email ?? '',
        `Confirming your ${request.appName} account deletion`,
        [
            'Hi,',
            `We’ve received a request to delete the ${request.appName} account for this email address.`,
            `If it was you, just reply to this email to confirm, and we’ll delete your account and everything in it ${deletionTime} of your request.`,
            'If it wasn’t you, you can ignore this email and your account will stay as it is.',
            'Thanks,\nijji labs',
        ].join('\n\n'),
    );

/** The last step: tells them it's done. */
export const doneEmail = (request: DeletionRequest) =>
    email(
        request.email ?? '',
        `Your ${request.appName} account has been deleted`,
        [
            'Hi,',
            `As you asked, we’ve deleted your ${request.appName} account and everything tied to it: your profile, activities, goals, sessions and notes.`,
            `Thanks for using ${request.appName}.`,
            'ijji labs',
        ].join('\n\n'),
    );

/**
 * SQL for the production project's SQL editor that deletes the account with this email, the
 * same way Delete account does in the app (ijji-tracker.mobile's `delete_account()`): free
 * any classroom seats, clear what doesn't cascade, then delete the user (everything else
 * cascades). Keep it in step with that function.
 */
export const deletionSql = (accountEmail: string) => {
    const quoted = `'${accountEmail.replace(/'/g, "''")}'`;
    return `-- Deletes the IJJI Tracker account for ${accountEmail.replace(/[\r\n]/g, ' ')} and everything tied to it,
-- as Delete account does in the app. Stops if there's no such account.
do $$
declare
    uid uuid := (select id from auth.users where lower(email) = lower(${quoted}));
begin
    if uid is null then
        raise exception 'No account with that email';
    end if;

    update public.classrooms c
    set member_count = greatest(c.member_count - 1, 0)
    from public.classroom_members m
    where m.classroom_id = c.id and m.user_id = uid and m.left_at is null;

    delete from public.classroom_members where user_id = uid;
    delete from public.sessions where user_id = uid;
    update public.classrooms set created_by = null where created_by = uid;

    delete from auth.users where id = uid;
    raise notice 'Deleted %', uid;
end $$;`;
};
