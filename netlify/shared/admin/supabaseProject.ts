import { z } from '../../../src/lib/zod.ts';
import { scrub } from './scrub.ts';

// IJJI Tracker's two Supabase projects, as the admin functions see them: production and
// develop, each with its URL, service key and Management API access token (all secret,
// Functions scope only). Supabase's access tokens can be limited to one organisation, and
// the two projects are in separate ones, so each has its own token. The key is
// used for one thing: calling the counts-only admin_stats() and admin_db_stats() functions
// (ijji-tracker.mobile: supabase/migrations/20261118120000_admin_stats.sql). Their results
// are checked against a fixed shape and only those fields are passed on.

export const ENVIRONMENTS = ['prod', 'dev'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export type Project = {
    env: Environment;
    url: string;
    ref: string;
    key: string | null;
    /** The project's Management API token, or null with `tokenName` saying what to set. */
    token: string | null;
    tokenName: string;
};

/** The free plan's database size limit, for the size meter. */
export const FREE_DATABASE_BYTES = 500 * 1024 * 1024;

/** A project from the environment, or why it can't be reached. */
export const projectFor = (
    env: Environment,
    vars: Record<string, string | undefined> = process.env,
): Project | { error: string } => {
    const prefix = env === 'prod' ? 'SUPABASE_PROD' : 'SUPABASE_DEV';
    const urlName = `${prefix}_URL`;
    const keyName = `${prefix}_SERVICE_KEY`;
    const tokenName = `${prefix}_ACCESS_TOKEN`;
    const raw = vars[urlName];
    if (!raw) return { error: `${urlName} isn’t set in Netlify yet.` };

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return { error: `${urlName} isn’t a URL.` };
    }
    // Only a hosted project's own address: <ref>.supabase.co.
    const ref = /^([a-z0-9]{20})\.supabase\.co$/.exec(url.hostname)?.[1];
    if (url.protocol !== 'https:' || !ref) return { error: `${urlName} isn’t a Supabase URL.` };

    return {
        env,
        url: url.origin,
        ref,
        key: vars[keyName] || null,
        // One token for both still works, for an account-wide token.
        token: vars[tokenName] || vars.SUPABASE_ACCESS_TOKEN || null,
        tokenName,
    };
};

const days = z.array(z.number().int().min(0)).length(90);

const statsSchema = z.object({
    from: z.iso.date(),
    users: z.number().int().min(0),
    confirmed: z.number().int().min(0),
    signups_by_day: days,
    sessions_by_day: days,
    minutes_by_day: days,
    sessions: z.number().int().min(0),
    recorders: z.object({
        day: z.number().int().min(0),
        week: z.number().int().min(0),
        month: z.number().int().min(0),
    }),
});

const dbSchema = z.object({
    database_bytes: z.number().min(0),
    tables: z
        .array(
            z.object({
                name: z.string().regex(/^\w{1,63}$/),
                rows: z.number().min(0),
                bytes: z.number().min(0),
            }),
        )
        .nullable(),
    migrations: z
        .object({ count: z.number().int().min(0), latest: z.string().nullable() })
        .nullable(),
});

export type UsageStats = {
    from: string;
    users: number;
    confirmed: number;
    signupsByDay: number[];
    sessionsByDay: number[];
    minutesByDay: number[];
    sessions: number;
    recorders: { day: number; week: number; month: number };
};

export type DatabaseStats = {
    bytes: number;
    limitBytes: number;
    tables: { name: string; rows: number; bytes: number }[];
    migrations: { count: number; latest: string | null } | null;
};

const rpc = async (project: Project, name: 'admin_stats' | 'admin_db_stats', body: object) => {
    const keyName = `SUPABASE_${project.env.toUpperCase()}_SERVICE_KEY`;
    if (!project.key) throw new Error(`${keyName} isn’t set in Netlify yet.`);
    const response = await fetch(`${project.url}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
            apikey: project.key,
            // The older JWT service_role keys also go as a bearer token; sb_secret_ keys don't.
            ...(project.key.startsWith('eyJ') && { Authorization: `Bearer ${project.key}` }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return response.json();

    // PostgREST says what went wrong as { code, message }: say it in words that point to the fix.
    const error = (await response.json().catch(() => ({}))) as {
        code?: unknown;
        message?: unknown;
    };
    const code = typeof error.code === 'string' ? error.code : null;
    console.error(`Supabase ${name}() answered ${response.status}`, code ?? '');
    if (response.status === 404 || code === 'PGRST202') {
        throw new Error(
            `${name}() isn’t in this project yet: apply the admin_stats migration (npx supabase db push).`,
        );
    }
    if (response.status === 401 || response.status === 403 || code === '42501') {
        throw new Error(
            `Supabase refused the key: check ${keyName} is this project’s secret (service_role) key, not its publishable (anon) key.`,
        );
    }
    const detail = typeof error.message === 'string' ? `: ${scrub(error.message, 160)}` : '';
    throw new Error(`Supabase answered ${response.status}${code ? ` (${code})` : ''}${detail}`);
};

/** Checks a reply's shape, saying which part was off rather than throwing zod's details. */
const shaped = <T>(schema: z.ZodType<T>, value: unknown, name: string): T => {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    const where = result.error.issues[0]?.path.join('.') || 'the reply';
    console.error(`Supabase ${name}() answered in an unexpected shape at`, where);
    throw new Error(
        `${name}() answered in an unexpected shape (at ${where}): is the migration up to date?`,
    );
};

/** Users, sign-ups and sessions, as counts. The admin's own accounts are left out. */
export const usageStats = async (project: Project, exclude: string[]): Promise<UsageStats> => {
    const s = shaped(statsSchema, await rpc(project, 'admin_stats', { exclude }), 'admin_stats');
    return {
        from: s.from,
        users: s.users,
        confirmed: s.confirmed,
        signupsByDay: s.signups_by_day,
        sessionsByDay: s.sessions_by_day,
        minutesByDay: s.minutes_by_day,
        sessions: s.sessions,
        recorders: s.recorders,
    };
};

/** The database's size against the free plan's limit, its tables, and its migrations. */
export const databaseStats = async (project: Project): Promise<DatabaseStats> => {
    const d = shaped(dbSchema, await rpc(project, 'admin_db_stats', {}), 'admin_db_stats');
    return {
        bytes: d.database_bytes,
        limitBytes: FREE_DATABASE_BYTES,
        tables: d.tables ?? [],
        migrations: d.migrations,
    };
};
