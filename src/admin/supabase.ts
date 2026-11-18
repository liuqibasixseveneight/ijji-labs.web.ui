// The Supabase section's data, as GET /api/admin/supabase sends it (netlify/functions/
// admin-supabase), and the small helpers its page uses. Plain TypeScript only.

import type { Part } from './website.ts';

export const ENVIRONMENTS = ['prod', 'dev'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];
export const ENVIRONMENT_LABELS: Record<Environment, string> = {
    prod: 'Production',
    dev: 'Develop',
};

export type ProjectStatus = { name: string; region: string; status: string; paused: boolean };
export type ServiceHealth = { name: string; status: string; healthy: boolean };

export type UsageStats = {
    /** The first of the 90 days in the daily counts (UTC). */
    from: string;
    users: number;
    confirmed: number;
    signupsByDay: number[];
    sessionsByDay: number[];
    minutesByDay: number[];
    sessions: number;
    /** People who recorded a session in the last day, 7 days and 30 days. */
    recorders: { day: number; week: number; month: number };
};

export type DatabaseStats = {
    bytes: number;
    limitBytes: number;
    tables: { name: string; rows: number; bytes: number }[];
    migrations: { count: number; latest: string | null } | null;
};

export type Lint = {
    name: string;
    title: string;
    level: 'ERROR' | 'WARN' | 'INFO';
    detail: string;
    remediation: string | null;
};

export type Traffic = {
    hours: { at: number; requests: number; clientErrors: number; serverErrors: number }[];
    topErrors: { status: number; method: string; path: string; count: number }[];
};

export type Supabase = {
    env: Environment;
    now: number;
    /** The project's ref, for links to its dashboard; null when it isn't set up. */
    ref: string | null;
    project: Part<ProjectStatus>;
    health: Part<ServiceHealth[]>;
    usage: Part<UsageStats>;
    database: Part<DatabaseStats>;
    security: Part<Lint[]>;
    performance: Part<Lint[]>;
    traffic: Part<Traffic>;
};

export const PARTS = [
    'project',
    'health',
    'usage',
    'database',
    'security',
    'performance',
    'traffic',
] as const;

/** The environment in a URL's `?env=`, production unless it says develop. */
export const environmentFrom = (search: string): Environment =>
    new URLSearchParams(search).get('env') === 'dev' ? 'dev' : 'prod';

/** A project's state in words, and how it should look. */
export const projectState = (status: string) =>
    status === 'ACTIVE_HEALTHY'
        ? { label: 'Active', level: 'good' as const }
        : status === 'INACTIVE' || status === 'PAUSING'
          ? { label: 'Paused', level: 'critical' as const }
          : ['COMING_UP', 'RESTORING', 'UPGRADING', 'RESTARTING', 'RESIZING'].includes(status)
            ? { label: 'Starting', level: 'warning' as const }
            : {
                  label: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' '),
                  level: 'critical' as const,
              };

export const LINT_LEVELS = {
    ERROR: { label: 'Error', level: 'critical' as const },
    WARN: { label: 'Warning', level: 'warning' as const },
    INFO: { label: 'Info', level: 'neutral' as const },
};

const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

/** The sum of the last `days` of a daily series. */
export const lastDaysOf = (values: number[], days: number) => total(values.slice(-days));

/** The days of a 90-day series, from its first day (UTC). */
export const seriesDays = (from: string, length: number) => {
    const start = Date.parse(`${from}T00:00:00Z`);
    return Array.from({ length }, (_, i) =>
        new Date(start + i * 86_400_000).toISOString().slice(0, 10),
    );
};

const units = ['B', 'kB', 'MB', 'GB'];

/** A size for people: "12.4 MB". */
export const formatBytes = (bytes: number) => {
    let value = bytes;
    let unit = 0;
    while (value >= 1000 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};

/** A migration version (yyyymmddhhmmss) as a date: "18 Nov 2026"; else as it is. */
export const migrationDate = (version: string) => {
    const match = /^(\d{4})(\d{2})(\d{2})/.exec(version);
    if (!match) return version;
    const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

/** The project's page in Supabase's dashboard. */
export const dashboardUrl = (ref: string, page = '') =>
    `https://supabase.com/dashboard/project/${ref}${page}`;
