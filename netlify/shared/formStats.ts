import { store } from './blobs.ts';

// How the site's forms are used, for the admin dashboard: one empty entry per post, its key
// saying which form, which day and how it went. No names, emails, messages or IP addresses:
// nothing about who sent it. Counting is done from the keys alone.

export const FORMS = ['contact', 'account-deletion'] as const;
export type FormName = (typeof FORMS)[number];

/** How a post went: emailed to the studio, refused as invalid, a bot (honeypot), or failed to send. */
export const OUTCOMES = ['sent', 'invalid', 'bot', 'failed'] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Counts are kept for this many days, then cleared by the daily Lighthouse job. */
export const KEEP_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;
const day = (at: number) => new Date(at).toISOString().slice(0, 10);

// The form functions are Lambda-style: writes must use eventual consistency (see blobs.ts).
const stats = (consistency?: 'eventual') => store('form-stats', consistency);

/**
 * Counts one post. Never throws and never holds the form up for long: a Blobs outage must
 * not stop a form from working.
 */
export const countForm = async (form: FormName, outcome: Outcome, now = Date.now()) => {
    try {
        await stats('eventual').set(`${form}/${day(now)}/${outcome}/${crypto.randomUUID()}`, '');
    } catch (error) {
        console.error('Form post not counted:', error);
    }
};

export type FormStats = {
    /** The days covered, oldest first, as YYYY-MM-DD. */
    days: string[];
    forms: Record<FormName, { byDay: Record<Outcome, number>[]; total: Record<Outcome, number> }>;
};

const zero = (): Record<Outcome, number> => ({ sent: 0, invalid: 0, bot: 0, failed: 0 });

/** Each form's posts per day and outcome over the last `days` days (today included). */
export const readFormStats = async (days = 30, now = Date.now()): Promise<FormStats> => {
    const dates = Array.from({ length: days }, (_, i) => day(now - (days - 1 - i) * DAY));
    const index = new Map(dates.map((date, i) => [date, i]));

    const forms = Object.fromEntries(
        FORMS.map((form) => [form, { byDay: dates.map(zero), total: zero() }]),
    ) as FormStats['forms'];

    // Both forms' lists at once: each is a round trip to the store.
    const lists = await Promise.all(
        FORMS.map(async (form) => ({ form, ...(await stats().list({ prefix: `${form}/` })) })),
    );
    for (const { form, blobs } of lists) {
        for (const { key } of blobs) {
            const [, date, outcome] = key.split('/');
            const i = index.get(date);
            if (i === undefined || !(OUTCOMES as readonly string[]).includes(outcome)) continue;
            forms[form].byDay[i][outcome as Outcome]++;
            forms[form].total[outcome as Outcome]++;
        }
    }

    return { days: dates, forms };
};

/** Deletes counts older than {@link KEEP_DAYS}. */
export const pruneFormStats = async (now = Date.now()) => {
    const cutoff = day(now - KEEP_DAYS * DAY);
    let deleted = 0;
    for (const form of FORMS) {
        const { blobs } = await stats().list({ prefix: `${form}/` });
        for (const { key } of blobs) {
            if (key.split('/')[1] < cutoff) {
                await stats().delete(key);
                deleted++;
            }
        }
    }
    return deleted;
};
