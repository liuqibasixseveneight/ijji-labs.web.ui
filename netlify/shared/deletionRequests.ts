import { DAY, OPEN, type DeletionRequest, type Status } from '../../src/admin/deletionRequests.ts';
import { site } from '../../src/content/site.ts';
import { store } from './blobs.ts';

// Web requests to delete an app account (from /apps/<slug>/delete-account), kept in Blobs so
// the admin dashboard can show them until they're dealt with. The website privacy policy says
// what's kept and for how long; change both together.

export { daysLeft, OPEN, STATUSES } from '../../src/admin/deletionRequests.ts';
export type { DeletionRequest, Status } from '../../src/admin/deletionRequests.ts';

/** After a request is closed, its email and reason are kept this long, then removed. */
export const REDACT_AFTER_DAYS = site.deletionRequestDetailsDays;
/** After a request is closed, its record (dates and status only by then) is kept this long. */
export const DELETE_AFTER_DAYS = site.deletionRequestRecordDays;

const requests = (consistency?: 'eventual') => store('deletion-requests', consistency);
const key = (id: string) => `request/${id}`;

/**
 * Saves a new request; its id. Throws if Blobs can't be reached (the caller still emails).
 * Called from the Lambda-style form function, so it writes with eventual consistency.
 */
export const saveRequest = async (
    input: { app: string; appName: string; email: string; reason?: string },
    now = Date.now(),
) => {
    const request: DeletionRequest = {
        id: crypto.randomUUID(),
        app: input.app,
        appName: input.appName,
        email: input.email,
        reason: input.reason || null,
        receivedAt: now,
        dueAt: now + site.deletionDays * DAY,
        status: 'new',
        history: [{ at: now, status: 'new' }],
    };
    await requests('eventual').setJSON(key(request.id), request);
    return request.id;
};

const getRequest = async (id: string) =>
    (await requests().get(key(id), { type: 'json' })) as DeletionRequest | null;

/** Every request, open ones first (soonest due), then closed ones (latest first). */
export const listRequests = async () => {
    const { blobs } = await requests().list({ prefix: 'request/' });
    const all = (
        await Promise.all(blobs.map((blob) => getRequest(blob.key.slice('request/'.length))))
    ).filter((request): request is DeletionRequest => request !== null);

    const open = all.filter((r) => OPEN.includes(r.status)).sort((a, b) => a.dueAt - b.dueAt);
    const closed = all
        .filter((r) => !OPEN.includes(r.status))
        .sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0));
    return [...open, ...closed];
};

/**
 * Moves a request on, noting when and why. The only change the dashboard can make: it can't
 * create, edit or delete a request. Null if there's no such request.
 */
export const changeStatus = async (
    id: string,
    status: Status,
    note: string | undefined,
    now = Date.now(),
) => {
    const request = await getRequest(id);
    if (!request) return null;

    const closing = !OPEN.includes(status);
    const updated: DeletionRequest = {
        ...request,
        status,
        closedAt: closing ? (request.closedAt ?? now) : undefined,
        history: [...request.history, { at: now, status, ...(note && { note }) }],
    };
    await requests().setJSON(key(id), updated);
    return updated;
};

/**
 * Keeps only what the privacy policy says: a closed request loses its email and reason
 * {@link REDACT_AFTER_DAYS} days after it closed, and is deleted after {@link DELETE_AFTER_DAYS}.
 * Notes are dropped with the email, as they may mention the person.
 */
export const pruneRequests = async (now = Date.now()) => {
    let redacted = 0;
    let deleted = 0;

    for (const request of await listRequests()) {
        if (request.closedAt === undefined) continue;
        const age = now - request.closedAt;

        if (age >= DELETE_AFTER_DAYS * DAY) {
            await requests().delete(key(request.id));
            deleted++;
        } else if (age >= REDACT_AFTER_DAYS * DAY && request.email !== null) {
            await requests().setJSON(key(request.id), {
                ...request,
                email: null,
                reason: null,
                history: request.history.map(({ at, status }) => ({ at, status })),
            });
            redacted++;
        }
    }

    return { redacted, deleted };
};
