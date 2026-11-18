// The website section's data, as GET /api/admin/website sends it (netlify/functions/
// admin-website), and the small helpers its page uses. Plain TypeScript only.

export type Part<T> = { data: T | null; error: string | null };

export type CheckSummary = {
    name: string;
    path: string;
    latest: { path: string; ok: boolean; status: number; ms: number } | null;
    lastCheckedAt: number | null;
    uptime24h: number | null;
    uptime7d: number | null;
    averageMs24h: number | null;
    recent: { at: number; ok: boolean; ms: number }[];
};

export const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Scores = Record<Category, number | null>;

export const CATEGORY_LABELS: Record<Category, string> = {
    performance: 'Performance',
    accessibility: 'Accessibility',
    'best-practices': 'Best practices',
    seo: 'SEO',
};

export type LighthouseRow = {
    page: string;
    path: string;
    strategy: 'mobile' | 'desktop';
    latest: { date: string; at: number; scores: Scores } | null;
    history: { date: string; at: number; scores: Scores }[];
};

export type Deploy = {
    id: string;
    state: string;
    context: string;
    branch: string | null;
    title: string | null;
    commitRef: string | null;
    createdAt: string;
    publishedAt: string | null;
    deployTime: number | null;
    errorMessage: string | null;
    adminUrl: string;
};

export const OUTCOMES = ['sent', 'invalid', 'bot', 'failed'] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type Counts = Record<Outcome, number>;

export const OUTCOME_LABELS: Record<Outcome, string> = {
    sent: 'Sent',
    invalid: 'Invalid',
    bot: 'Bots',
    failed: 'Failed to send',
};

export type FormStats = {
    days: string[];
    forms: Record<'contact' | 'account-deletion', { byDay: Counts[]; total: Counts }>;
};

export const FORM_LABELS = { contact: 'Contact', 'account-deletion': 'Delete account' } as const;

export type Website = {
    now: number;
    uptime: Part<CheckSummary[]>;
    lighthouse: Part<LighthouseRow[]>;
    deploys: Part<Deploy[]>;
    forms: Part<FormStats>;
};

/** Lighthouse's own bands: 90+ good, 50-89 needs work, under 50 poor. */
export const scoreLevel = (score: number) =>
    score >= 90 ? 'good' : score >= 50 ? 'warning' : 'critical';

export const SCORE_LABELS = { good: 'Good', warning: 'Needs work', critical: 'Poor' } as const;

/** A deploy's state as the dashboard shows it, with how it should look. */
export const deployStatus = (state: string) =>
    state === 'ready'
        ? { label: 'Published', level: 'good' as const }
        : state === 'error'
          ? { label: 'Failed', level: 'critical' as const }
          : ['building', 'enqueued', 'processing', 'uploading', 'preparing', 'new'].includes(state)
            ? { label: 'Building', level: 'warning' as const }
            : { label: state.charAt(0).toUpperCase() + state.slice(1), level: 'neutral' as const };

/** Sum of a day's or a period's counts. */
export const sum = (counts: Counts) =>
    OUTCOMES.reduce((total, outcome) => total + counts[outcome], 0);

/** The last `days` days' counts added up. */
export const lastDays = (byDay: Counts[], days: number): Counts =>
    byDay.slice(-days).reduce(
        (total, day) => ({
            sent: total.sent + day.sent,
            invalid: total.invalid + day.invalid,
            bot: total.bot + day.bot,
            failed: total.failed + day.failed,
        }),
        { sent: 0, invalid: 0, bot: 0, failed: 0 },
    );
