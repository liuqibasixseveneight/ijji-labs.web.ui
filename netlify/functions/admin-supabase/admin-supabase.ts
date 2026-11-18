import type { Config } from '@netlify/functions';

import { json, withAdmin } from '../../shared/admin/http.ts';
import {
    advisors,
    projectStatus,
    serviceHealth,
    traffic,
    type ProjectStatus,
} from '../../shared/admin/supabaseMgmt.ts';
import {
    databaseStats,
    ENVIRONMENTS,
    projectFor,
    usageStats,
    type Environment,
} from '../../shared/admin/supabaseProject.ts';

export const config: Config = { path: '/api/admin/supabase' };

type Part<T> = { data: T | null; error: string | null };

/** One part's data, or why it couldn't be had: one failing source doesn't blank the page. */
const part = async <T>(load: () => Promise<T>): Promise<Part<T>> => {
    try {
        return { data: await load(), error: null };
    } catch (error) {
        console.error('Admin supabase:', error instanceof Error ? error.message : error);
        return { data: null, error: error instanceof Error ? error.message : 'Unavailable' };
    }
};

const missing = <T>(error: string): Part<T> => ({ data: null, error });

/**
 * GET /api/admin/supabase?env=prod|dev: one of IJJI Tracker's Supabase projects at a glance.
 * - Usage and database: counts from the project's own admin_stats() and admin_db_stats()
 *   (service key), with the admin's accounts left out.
 * - Status, service health, the Security and Performance Advisors, and the last 24 hours of
 *   API traffic: Supabase's Management API (access token), read-only.
 * Nothing here can identify a person: counts only, and anything from logs or advisors is
 * scrubbed of emails, ids, addresses and tokens.
 */
export default withAdmin(async (request, _session, env) => {
    const asked = new URL(request.url).searchParams.get('env') ?? 'prod';
    if (!ENVIRONMENTS.includes(asked as Environment)) {
        return json(400, { error: 'Choose prod or dev.' });
    }
    const which = asked as Environment;
    const now = Date.now();
    const project = projectFor(which);
    const token = process.env.SUPABASE_ACCESS_TOKEN;

    if ('error' in project) {
        const none = missing<never>(project.error);
        return json(200, {
            env: which,
            now,
            ref: null,
            project: none,
            health: none,
            usage: none,
            database: none,
            security: none,
            performance: none,
            traffic: none,
        });
    }

    const noToken = 'SUPABASE_ACCESS_TOKEN isn’t set in Netlify yet.';
    const status: Part<ProjectStatus> = token
        ? await part(() => projectStatus(token, project.ref))
        : missing(noToken);
    // A paused project answers nothing else; say so rather than wait for timeouts.
    const paused = status.data?.paused
        ? 'The project is paused. Restore it in Supabase’s dashboard to see this.'
        : null;
    const viaToken = <T>(load: (token: string) => Promise<T>) =>
        paused
            ? Promise.resolve(missing<T>(paused))
            : token
              ? part(() => load(token))
              : Promise.resolve(missing<T>(noToken));
    const viaKey = <T>(load: () => Promise<T>) =>
        paused ? Promise.resolve(missing<T>(paused)) : part(load);

    const [health, usage, database, security, performance, recent] = await Promise.all([
        viaToken((t) => serviceHealth(t, project.ref)),
        viaKey(() => usageStats(project, env.allowlist)),
        viaKey(() => databaseStats(project)),
        viaToken((t) => advisors(t, project.ref, 'security')),
        viaToken((t) => advisors(t, project.ref, 'performance')),
        viaToken((t) => traffic(t, project.ref, now)),
    ]);

    return json(200, {
        env: which,
        now,
        ref: project.ref,
        project: status,
        health,
        usage,
        database,
        security,
        performance,
        traffic: recent,
    });
});
