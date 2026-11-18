import type { ReactNode } from 'react';
import { Link, useLoaderData, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { markerLink } from '../../components/ui/atoms/TextLink/markerLink.ts';
import { AdminMeta } from '../components/AdminMeta.tsx';
import type { Loaded } from '../cache.ts';
import { Card } from '../components/Card.tsx';
import { Deferred } from '../components/Deferred.tsx';
import { Refresh } from '../components/Refresh.tsx';
import {
    Bone,
    LoadingStatus,
    SkeletonBars,
    SkeletonCard,
    SkeletonRows,
    SkeletonTiles,
} from '../components/Skeleton.tsx';
import { prefetchOn } from '../data.ts';
import { panel, secondaryAction } from '../components/styles.ts';
import { Bars, Meter } from '../components/supabase/charts.tsx';
import { StatusBadge } from '../components/website/charts.tsx';
import { adminPaths } from '../paths.ts';
import {
    dashboardUrl,
    ENVIRONMENT_LABELS,
    ENVIRONMENTS,
    environmentFrom,
    formatBytes,
    lastDaysOf,
    LINT_LEVELS,
    migrationDate,
    projectState,
    seriesDays,
    type Lint,
    type Supabase as SupabaseData,
} from '../supabase.ts';

const number = new Intl.NumberFormat('en-GB');
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const hour = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

const plural = (n: number, one: string, many = `${one}s`) =>
    `${number.format(n)} ${n === 1 ? one : many}`;

/** A tile's label: tight, so long words fit a phone-width tile. */
const tileLabel = 'text-[11px] font-bold tracking-wide uppercase text-neutral-600';

/** A number in a tile, with a short note under it. */
const Stat = ({
    label,
    value,
    note,
    className,
}: {
    label: string;
    value: ReactNode;
    note?: ReactNode;
    className?: string;
}) => (
    <div
        className={clsx(
            'rounded-xl bg-neutral-50 border border-neutral-200 p-3 min-w-0',
            className,
        )}
    >
        <dt className={tileLabel}>{label}</dt>
        <dd className='text-2xl font-extrabold tabular-nums'>{value}</dd>
        {note && <dd className='text-xs text-neutral-600'>{note}</dd>}
    </div>
);

/** A link out to Supabase's dashboard, saying it opens a new tab. */
const OpenIn = ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href} target='_blank' rel='noreferrer' className={clsx(secondaryAction, 'shrink-0')}>
        {children}
        <span aria-hidden='true'>↗</span>
        <span className='sr-only'> (opens Supabase in a new tab)</span>
    </a>
);

/** Production or develop, as two linked tabs. */
const EnvironmentSwitch = ({ current }: { current: SupabaseData['env'] }) => (
    <nav aria-label='Project' className='inline-flex rounded-xl bg-neutral-100 p-1 gap-1'>
        {ENVIRONMENTS.map((env) => (
            <Link
                key={env}
                to={{ pathname: adminPaths.supabase, search: env === 'prod' ? '' : '?env=dev' }}
                {...prefetchOn(`${adminPaths.supabase}${env === 'prod' ? '' : '?env=dev'}`)}
                aria-current={env === current ? 'page' : undefined}
                className={clsx(
                    'rounded-lg px-4 py-2 text-sm font-semibold',
                    env === current
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-700 hover:text-neutral-900',
                )}
            >
                {ENVIRONMENT_LABELS[env]}
            </Link>
        ))}
    </nav>
);

/** Each card's hint: on the card, and on its skeleton while it loads. */
const HINTS = {
    project: 'The project and its services, as Supabase reports them.',
    people: 'Accounts and sign-ups, per day over 90 days (UTC). Your admin account isn’t counted.',
    sessions: 'Sessions recorded, per day over 90 days (UTC), and how many people recorded one.',
    database: 'Its size against the free plan’s 500 MB, its tables, and the migrations applied.',
    security: 'What Supabase flags about access: check after every migration.',
    performance: 'Slow or wasteful queries and indexes Supabase has spotted.',
    traffic:
        'Requests to the project’s API over the last 24 hours, from its logs. Paths only: no queries, ids or addresses.',
};

/** The page as it will look, while a project's data loads the first time. */
const SupabaseSkeleton = ({ env }: { env: SupabaseData['env'] }) => (
    <div className='flex flex-col gap-6'>
        <LoadingStatus>{`Loading ${ENVIRONMENT_LABELS[env].toLowerCase()}’s data…`}</LoadingStatus>
        <SkeletonCard title={ENVIRONMENT_LABELS[env]} hint={HINTS.project}>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <Bone className='h-5 w-16 rounded-full' />
                    <Bone className='h-5 w-28' />
                </div>
                <div className='flex flex-wrap gap-2'>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <Bone key={i} className='h-5 w-20 rounded-full' />
                    ))}
                </div>
            </div>
        </SkeletonCard>
        <SkeletonCard title='People' hint={HINTS.people}>
            <div className='flex flex-col gap-5'>
                <SkeletonTiles count={4} />
                <SkeletonBars />
            </div>
        </SkeletonCard>
        <SkeletonCard title='Sessions' hint={HINTS.sessions}>
            <div className='flex flex-col gap-5'>
                <SkeletonTiles count={4} />
                <SkeletonBars />
            </div>
        </SkeletonCard>
        <SkeletonCard title='Database' hint={HINTS.database}>
            <div className='flex flex-col gap-5'>
                <Bone className='h-8 w-40' />
                <Bone className='h-2.5 w-full rounded-full' />
                <SkeletonRows count={3} />
            </div>
        </SkeletonCard>
        <div className='grid gap-6 lg:grid-cols-2'>
            <SkeletonCard title='Security Advisor' hint={HINTS.security}>
                <SkeletonRows count={2} />
            </SkeletonCard>
            <SkeletonCard title='Performance Advisor' hint={HINTS.performance}>
                <SkeletonRows count={2} />
            </SkeletonCard>
        </div>
        <SkeletonCard title='API traffic' hint={HINTS.traffic}>
            <div className='flex flex-col gap-5'>
                <SkeletonTiles count={3} />
                <SkeletonBars />
            </div>
        </SkeletonCard>
    </div>
);

/** One advisor's findings, most serious first, each with how to fix it. */
const Findings = ({ lints }: { lints: Lint[] }) =>
    lints.length === 0 ? (
        <p className='flex items-center gap-2 text-neutral-700'>
            <StatusBadge level='good' label='No findings' />
        </p>
    ) : (
        <ul className='divide-y divide-neutral-200'>
            {lints.map((lint, i) => (
                <li
                    key={`${lint.name}-${i}`}
                    className='py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5'
                >
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                        <StatusBadge {...LINT_LEVELS[lint.level]} />
                        <span className='font-semibold'>{lint.title}</span>
                    </div>
                    {lint.detail && (
                        <p className='text-sm text-neutral-700 [overflow-wrap:anywhere]'>
                            {lint.detail}
                        </p>
                    )}
                    {lint.remediation && (
                        <a
                            href={lint.remediation}
                            target='_blank'
                            rel='noreferrer'
                            className={clsx(
                                markerLink('light'),
                                'px-1 -mx-1 text-sm font-semibold self-start',
                            )}
                        >
                            How to fix it
                            <span className='sr-only'>: {lint.title} (opens in a new tab)</span>
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

/**
 * IJJI Tracker's Supabase projects, one at a time: whether the project is up, how many
 * people use the app (counts only), the database's size, what the advisors flag, and the
 * last day's API traffic.
 */
export const Supabase = () => {
    const loaded = useLoaderData() as Loaded<SupabaseData>;
    // From the address, so the tab moves the moment it's clicked, not when data arrives.
    const env = environmentFrom(useLocation().search);

    return (
        <>
            <AdminMeta title='Supabase' />
            <Section tone='light' spacing='md' labelledBy='supabase-title'>
                <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-8'>
                    <div>
                        <h1
                            id='supabase-title'
                            className='text-3xl sm:text-4xl font-extrabold mb-2'
                        >
                            Supabase
                        </h1>
                        <p className='text-neutral-600'>
                            IJJI Tracker’s projects. Counts only: never anyone’s details.
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
                        <Refresh loaded={loaded} cacheKey={`supabase:${env}`} />
                        <EnvironmentSwitch current={env} />
                    </div>
                </div>

                {/* Keyed by project: switching shows the other's skeleton, not this one's data. */}
                <Deferred key={env} loaded={loaded} fallback={<SupabaseSkeleton env={env} />}>
                    {(data) =>
                        !data ? (
                            <p className={panel}>
                                Couldn’t load Supabase’s data. Refresh to try again.
                            </p>
                        ) : (
                            <div className='flex flex-col gap-6'>
                                <Card
                                    id='project-title'
                                    title={ENVIRONMENT_LABELS[data.env]}
                                    hint={HINTS.project}
                                    part={data.project}
                                    action={
                                        data.ref && (
                                            <OpenIn href={dashboardUrl(data.ref)}>
                                                Open in Supabase
                                            </OpenIn>
                                        )
                                    }
                                >
                                    {(project) => (
                                        <div className='flex flex-col gap-4'>
                                            <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                                                <StatusBadge {...projectState(project.status)} />
                                                <span className='font-semibold'>
                                                    {project.name}
                                                </span>
                                                {project.region && (
                                                    <span className='text-sm text-neutral-600'>
                                                        {project.region}
                                                    </span>
                                                )}
                                            </div>
                                            {project.paused && (
                                                <p className='text-sm text-neutral-700'>
                                                    Free projects pause after a week without
                                                    traffic. Restore it from Supabase’s dashboard;
                                                    the counts below come back once it’s running.
                                                </p>
                                            )}
                                            {data.health.data ? (
                                                <ul
                                                    aria-label='Services'
                                                    className='flex flex-wrap gap-2'
                                                >
                                                    {data.health.data.map((service) => (
                                                        <li key={service.name}>
                                                            <StatusBadge
                                                                level={
                                                                    service.healthy
                                                                        ? 'good'
                                                                        : 'critical'
                                                                }
                                                                label={`${SERVICE_LABELS[service.name] ?? service.name}${service.healthy ? '' : ': down'}`}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                !project.paused && (
                                                    <p className='text-sm text-neutral-600'>
                                                        Services: {data.health.error}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    )}
                                </Card>

                                <Card
                                    id='people-title'
                                    title='People'
                                    hint={HINTS.people}
                                    part={data.usage}
                                >
                                    {(usage) => {
                                        const days = seriesDays(
                                            usage.from,
                                            usage.signupsByDay.length,
                                        );
                                        return (
                                            <div className='flex flex-col gap-5'>
                                                <dl className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                                    <Stat
                                                        label='Accounts'
                                                        value={number.format(usage.users)}
                                                    />
                                                    <Stat
                                                        label='Confirmed'
                                                        value={number.format(usage.confirmed)}
                                                        note={
                                                            usage.users
                                                                ? `${Math.round((usage.confirmed / usage.users) * 100)}% of accounts`
                                                                : null
                                                        }
                                                    />
                                                    <Stat
                                                        label='Sign-ups'
                                                        value={number.format(
                                                            lastDaysOf(usage.signupsByDay, 7),
                                                        )}
                                                        note='Last 7 days'
                                                    />
                                                    <Stat
                                                        label='Sign-ups'
                                                        value={number.format(
                                                            lastDaysOf(usage.signupsByDay, 30),
                                                        )}
                                                        note='Last 30 days'
                                                    />
                                                </dl>
                                                <Bars
                                                    caption='Sign-ups per day'
                                                    columnLabel='Day'
                                                    valueLabel='Sign-ups'
                                                    endLabel='Today'
                                                    describe={(n) => plural(n, 'sign-up')}
                                                    points={days.map((d, i) => ({
                                                        key: d,
                                                        label: day.format(new Date(d)),
                                                        value: usage.signupsByDay[i],
                                                    }))}
                                                />
                                            </div>
                                        );
                                    }}
                                </Card>

                                <Card
                                    id='sessions-title'
                                    title='Sessions'
                                    hint={HINTS.sessions}
                                    part={data.usage}
                                >
                                    {(usage) => {
                                        const days = seriesDays(
                                            usage.from,
                                            usage.sessionsByDay.length,
                                        );
                                        const hours = Math.round(
                                            lastDaysOf(usage.minutesByDay, 30) / 60,
                                        );
                                        return (
                                            <div className='flex flex-col gap-5'>
                                                <dl className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                                    <Stat
                                                        label='Active, 24 hours'
                                                        value={number.format(usage.recorders.day)}
                                                        note='Recorded a session'
                                                    />
                                                    <Stat
                                                        label='Active, 7 days'
                                                        value={number.format(usage.recorders.week)}
                                                        note='Recorded a session'
                                                    />
                                                    <Stat
                                                        label='Active, 30 days'
                                                        value={number.format(usage.recorders.month)}
                                                        note='Recorded a session'
                                                    />
                                                    <Stat
                                                        label='Focus time'
                                                        value={`${number.format(hours)} h`}
                                                        note={`${plural(lastDaysOf(usage.sessionsByDay, 30), 'session')} in 30 days`}
                                                    />
                                                </dl>
                                                <Bars
                                                    caption='Sessions recorded per day'
                                                    columnLabel='Day'
                                                    valueLabel='Sessions'
                                                    endLabel='Today'
                                                    describe={(n) => plural(n, 'session')}
                                                    points={days.map((d, i) => ({
                                                        key: d,
                                                        label: day.format(new Date(d)),
                                                        value: usage.sessionsByDay[i],
                                                    }))}
                                                />
                                                <p className='text-xs text-neutral-600 -mt-2'>
                                                    {plural(usage.sessions, 'session')} recorded in
                                                    all.
                                                </p>
                                            </div>
                                        );
                                    }}
                                </Card>

                                <Card
                                    id='database-title'
                                    title='Database'
                                    hint={HINTS.database}
                                    part={data.database}
                                    action={
                                        data.ref && (
                                            <OpenIn
                                                href={dashboardUrl(data.ref, '/database/tables')}
                                            >
                                                Tables
                                            </OpenIn>
                                        )
                                    }
                                >
                                    {(db) => (
                                        <div className='flex flex-col gap-5'>
                                            <div className='flex flex-col gap-2'>
                                                <p className='flex flex-wrap items-baseline justify-between gap-x-3'>
                                                    <span>
                                                        <span className='text-2xl font-extrabold tabular-nums'>
                                                            {formatBytes(db.bytes)}
                                                        </span>{' '}
                                                        <span className='text-neutral-600'>
                                                            of {formatBytes(db.limitBytes)}
                                                        </span>
                                                    </span>
                                                    {db.migrations && (
                                                        <span className='text-sm text-neutral-600'>
                                                            {plural(
                                                                db.migrations.count,
                                                                'migration',
                                                            )}
                                                            {db.migrations.latest &&
                                                                `, latest ${migrationDate(db.migrations.latest)}`}
                                                        </span>
                                                    )}
                                                </p>
                                                <Meter
                                                    label='Database size against the free plan’s limit'
                                                    used={db.bytes}
                                                    limit={db.limitBytes}
                                                />
                                            </div>
                                            {db.tables.length > 0 && (
                                                <div>
                                                    <h3 className='text-xs font-bold tracking-wide uppercase text-neutral-600 mb-2'>
                                                        Tables
                                                    </h3>
                                                    <ul className='divide-y divide-neutral-200 text-sm'>
                                                        {db.tables.map((table) => (
                                                            <li
                                                                key={table.name}
                                                                className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 py-2 first:pt-0 last:pb-0'
                                                            >
                                                                <code className='font-semibold [overflow-wrap:anywhere]'>
                                                                    {table.name}
                                                                </code>
                                                                <span className='text-neutral-600 tabular-nums whitespace-nowrap'>
                                                                    about{' '}
                                                                    {plural(table.rows, 'row')} ·{' '}
                                                                    {formatBytes(table.bytes)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>

                                <div className='grid gap-6 lg:grid-cols-2'>
                                    {(['security', 'performance'] as const).map((kind) => (
                                        <Card
                                            key={kind}
                                            id={`${kind}-title`}
                                            title={
                                                kind === 'security'
                                                    ? 'Security Advisor'
                                                    : 'Performance Advisor'
                                            }
                                            hint={
                                                kind === 'security'
                                                    ? HINTS.security
                                                    : HINTS.performance
                                            }
                                            part={data[kind]}
                                            action={
                                                data.ref && (
                                                    <OpenIn
                                                        href={dashboardUrl(
                                                            data.ref,
                                                            `/advisors/${kind}`,
                                                        )}
                                                    >
                                                        Advisor
                                                    </OpenIn>
                                                )
                                            }
                                        >
                                            {(lints) => <Findings lints={lints} />}
                                        </Card>
                                    ))}
                                </div>

                                <Card
                                    id='traffic-title'
                                    title='API traffic'
                                    hint={HINTS.traffic}
                                    part={data.traffic}
                                    action={
                                        data.ref && (
                                            <OpenIn href={dashboardUrl(data.ref, '/logs/explorer')}>
                                                Logs
                                            </OpenIn>
                                        )
                                    }
                                >
                                    {(traffic) => {
                                        const sum = (
                                            key: 'requests' | 'clientErrors' | 'serverErrors',
                                        ) => traffic.hours.reduce((total, h) => total + h[key], 0);
                                        return (
                                            <div className='flex flex-col gap-5'>
                                                <dl className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                                                    {/* Full width on phones, so the errors pair up below. */}
                                                    <Stat
                                                        label='Requests'
                                                        value={number.format(sum('requests'))}
                                                        note='Last 24 hours'
                                                        className='col-span-2 sm:col-span-1'
                                                    />
                                                    <Stat
                                                        label='Server errors'
                                                        value={
                                                            <span
                                                                className={clsx(
                                                                    sum('serverErrors') > 0 &&
                                                                        'text-red-800',
                                                                )}
                                                            >
                                                                {number.format(sum('serverErrors'))}
                                                            </span>
                                                        }
                                                        note='5xx: on Supabase’s side'
                                                    />
                                                    <Stat
                                                        label='Refused'
                                                        value={number.format(sum('clientErrors'))}
                                                        note='4xx: wrong password, no access…'
                                                    />
                                                </dl>
                                                {traffic.hours.length > 1 && (
                                                    <Bars
                                                        caption='API requests per hour'
                                                        columnLabel='Hour'
                                                        valueLabel='Requests'
                                                        endLabel='Now'
                                                        describe={(n) => plural(n, 'request')}
                                                        points={traffic.hours.map((h) => ({
                                                            key: String(h.at),
                                                            label: hour.format(h.at),
                                                            value: h.requests,
                                                        }))}
                                                    />
                                                )}
                                                <div>
                                                    <h3 className='text-xs font-bold tracking-wide uppercase text-neutral-600 mb-2'>
                                                        Commonest server errors
                                                    </h3>
                                                    {traffic.topErrors.length === 0 ? (
                                                        <StatusBadge
                                                            level='good'
                                                            label='None in 24 hours'
                                                        />
                                                    ) : (
                                                        <ul className='divide-y divide-neutral-200 text-sm'>
                                                            {traffic.topErrors.map((e, i) => (
                                                                <li
                                                                    key={i}
                                                                    className='flex flex-wrap items-baseline justify-between gap-x-4 py-2 first:pt-0 last:pb-0'
                                                                >
                                                                    <code className='[overflow-wrap:anywhere]'>
                                                                        <span className='font-semibold text-red-800'>
                                                                            {e.status}
                                                                        </span>{' '}
                                                                        {e.method} {e.path}
                                                                    </code>
                                                                    <span className='text-neutral-600 whitespace-nowrap'>
                                                                        {plural(e.count, 'time')}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }}
                                </Card>
                            </div>
                        )
                    }
                </Deferred>
            </Section>
        </>
    );
};

const SERVICE_LABELS: Record<string, string> = {
    db: 'Database',
    auth: 'Auth',
    rest: 'API',
    storage: 'Storage',
    realtime: 'Realtime',
};
