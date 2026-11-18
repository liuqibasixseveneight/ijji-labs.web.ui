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

/** A run's key timings: ms, except CLS. Absent on runs from before they were kept. */
export type Metrics = Record<'fcp' | 'lcp' | 'tbt' | 'cls' | 'si', number | null>;
export type LighthouseEntry = { date: string; at: number; scores: Scores; metrics?: Metrics };

export type LighthouseRow = {
    page: string;
    path: string;
    strategy: 'mobile' | 'desktop';
    latest: LighthouseEntry | null;
    history: LighthouseEntry[];
};

/**
 * A run's timings, each with Lighthouse's abbreviation, a plain name ("Blocking time"), its
 * value ("1,180 ms") and whether it's in Lighthouse's good range, so a dropped score shows
 * its cause.
 */
export const describeMetrics = (metrics: Metrics | undefined) => {
    if (!metrics) return [];
    const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
    const facts: { label: string; name: string; value: string; good: boolean }[] = [];
    const add = (label: string, name: string, value: string, good: boolean) =>
        facts.push({ label, name, value, good });
    if (metrics.fcp !== null) add('FCP', 'First paint', seconds(metrics.fcp), metrics.fcp <= 1800);
    if (metrics.lcp !== null)
        add('LCP', 'Largest paint', seconds(metrics.lcp), metrics.lcp <= 2500);
    if (metrics.tbt !== null)
        add(
            'TBT',
            'Blocking time',
            `${metrics.tbt.toLocaleString('en-GB')} ms`,
            metrics.tbt <= 200,
        );
    if (metrics.cls !== null) add('CLS', 'Layout shift', String(metrics.cls), metrics.cls <= 0.1);
    if (metrics.si !== null) add('SI', 'Speed index', seconds(metrics.si), metrics.si <= 3400);
    return facts;
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
