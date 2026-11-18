import { scrub, scrubPath } from './scrub.ts';

// Supabase's Management API, read-only, from the admin functions. A personal access token
// (SUPABASE_PROD_ACCESS_TOKEN, SUPABASE_DEV_ACCESS_TOKEN) may be able to change anything in its
// organisation, so this
// file only ever sends GET, only to the paths below, for a project ref of the right shape,
// and passes on picked fields (scrubbed) rather than Supabase's replies.

const API = 'https://api.supabase.com';

/** Every path this file may call; anything else throws before a request is made. */
const ALLOWED = [
    /^\/v1\/projects\/[a-z0-9]{20}$/,
    /^\/v1\/projects\/[a-z0-9]{20}\/health$/,
    /^\/v1\/projects\/[a-z0-9]{20}\/advisors\/(security|performance)$/,
    /^\/v1\/projects\/[a-z0-9]{20}\/analytics\/endpoints\/logs$/,
];

export const get = async (token: string, path: string, query: Record<string, string> = {}) => {
    if (!ALLOWED.some((pattern) => pattern.test(path))) throw new Error('Not an allowed path');
    const url = new URL(path, API);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

    const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'ijji-labs-admin' },
        signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 401 || response.status === 403) {
        throw new Error(
            'Supabase refused the access token: check it’s for this project’s organisation and can read it.',
        );
    }
    if (!response.ok) throw new Error(`Supabase’s API answered ${response.status}`);
    return response.json();
};

export type ProjectStatus = { name: string; region: string; status: string; paused: boolean };

/** The project's name, region and state (paused projects are INACTIVE). */
export const projectStatus = async (token: string, ref: string): Promise<ProjectStatus> => {
    const p = (await get(token, `/v1/projects/${ref}`)) as Record<string, unknown>;
    const status = typeof p.status === 'string' ? p.status : 'UNKNOWN';
    return {
        name: typeof p.name === 'string' ? scrub(p.name, 60) : ref,
        region: typeof p.region === 'string' ? scrub(p.region, 30) : '',
        status,
        paused: status === 'INACTIVE' || status === 'PAUSING',
    };
};

export const SERVICES = ['db', 'auth', 'rest', 'storage', 'realtime'] as const;
export type ServiceHealth = { name: string; status: string; healthy: boolean };

/** Whether each of the project's services is up. */
export const serviceHealth = async (token: string, ref: string): Promise<ServiceHealth[]> => {
    const rows = (await get(token, `/v1/projects/${ref}/health`, {
        services: SERVICES.join(','),
    })) as { name?: unknown; status?: unknown; healthy?: unknown }[];
    if (!Array.isArray(rows)) throw new Error('Unexpected health answer');
    return rows
        .filter((row) => SERVICES.includes(row.name as (typeof SERVICES)[number]))
        .map((row) => ({
            name: row.name as string,
            status: typeof row.status === 'string' ? row.status : 'UNKNOWN',
            healthy: row.status === 'ACTIVE_HEALTHY' || (row.status === undefined && !!row.healthy),
        }));
};

export type Lint = {
    name: string;
    title: string;
    level: 'ERROR' | 'WARN' | 'INFO';
    detail: string;
    /** Supabase's page on fixing it. */
    remediation: string | null;
};

const LEVELS = ['ERROR', 'WARN', 'INFO'] as const;

/** The Security or Performance Advisor's findings, most serious first. */
export const advisors = async (
    token: string,
    ref: string,
    kind: 'security' | 'performance',
): Promise<Lint[]> => {
    const body = (await get(token, `/v1/projects/${ref}/advisors/${kind}`)) as {
        lints?: Record<string, unknown>[];
    };
    if (!Array.isArray(body.lints)) throw new Error('Unexpected advisors answer');
    return body.lints
        .map((lint) => ({
            name: scrub(String(lint.name ?? ''), 60),
            title: scrub(String(lint.title ?? lint.name ?? 'Finding'), 120),
            level: LEVELS.includes(lint.level as Lint['level'])
                ? (lint.level as Lint['level'])
                : 'INFO',
            detail: scrub(String(lint.detail ?? lint.description ?? ''), 400),
            remediation:
                typeof lint.remediation === 'string' &&
                lint.remediation.startsWith('https://supabase.com/')
                    ? lint.remediation
                    : null,
        }))
        .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
};

export type Traffic = {
    /** The last 24 hours, oldest first, one entry per hour with requests. */
    hours: { at: number; requests: number; clientErrors: number; serverErrors: number }[];
    /** The commonest server errors: method, path (no query string, scrubbed) and count. */
    topErrors: { status: number; method: string; path: string; count: number }[];
};

const status = "toInt32OrZero(log_attributes['response.status_code'])";
const HOURLY = `select toStartOfHour(timestamp) as hour, count() as requests,
countIf(${status} >= 500) as server_errors,
countIf(${status} >= 400 and ${status} < 500) as client_errors
from logs where source = 'edge_logs' group by hour order by hour`;
const TOP_ERRORS = `select ${status} as status, log_attributes['request.method'] as method,
log_attributes['request.path'] as path, count() as count
from logs where source = 'edge_logs' and ${status} >= 500
group by status, method, path order by count desc limit 5`;

/** A log timestamp (a string such as "2026-11-18 13:00:00" in UTC, or microseconds). */
export const logTime = (value: unknown) => {
    if (typeof value === 'number') return value > 1e14 ? Math.round(value / 1000) : value;
    if (typeof value !== 'string') return NaN;
    const iso = value.replace(' ', 'T');
    return Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
};

/** API requests and errors over the last 24 hours, from the API gateway's logs. */
export const traffic = async (token: string, ref: string, now = Date.now()): Promise<Traffic> => {
    const window = {
        iso_timestamp_start: new Date(now - 24 * 3600_000).toISOString(),
        iso_timestamp_end: new Date(now).toISOString(),
    };
    const path = `/v1/projects/${ref}/analytics/endpoints/logs`;
    const [hourly, errors] = (await Promise.all([
        get(token, path, { sql: HOURLY, ...window }),
        get(token, path, { sql: TOP_ERRORS, ...window }),
    ])) as { result?: Record<string, unknown>[]; error?: unknown }[];
    if (!Array.isArray(hourly.result) || !Array.isArray(errors.result)) {
        throw new Error('Supabase couldn’t read the logs.');
    }
    const n = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0);

    return {
        hours: hourly.result
            .map((row) => ({
                at: logTime(row.hour),
                requests: n(row.requests),
                clientErrors: n(row.client_errors),
                serverErrors: n(row.server_errors),
            }))
            .filter((row) => Number.isFinite(row.at)),
        topErrors: errors.result.map((row) => ({
            status: n(row.status),
            method: /^[A-Z]{3,7}$/.test(String(row.method)) ? String(row.method) : '?',
            path: scrubPath(String(row.path ?? '')),
            count: n(row.count),
        })),
    };
};
