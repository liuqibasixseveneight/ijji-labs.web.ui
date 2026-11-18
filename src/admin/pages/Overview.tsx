import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { ArtisticFrame } from '../../components/ui/atoms/ArtisticFrame/ArtisticFrame.tsx';
import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { SignOutEverywhere } from '../components/SignOutEverywhere.tsx';
import { daysLeft, describeDaysLeft, OPEN, urgency } from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData, OverviewData } from '../routes.tsx';
import { lastDaysOf, projectState } from '../supabase.ts';
import { StatusBadge } from '../components/website/charts.tsx';
import { deployStatus, scoreLevel, SCORE_LABELS } from '../website.ts';

/** The sections still to come, as each step of the dashboard is built. */
const COMING = [
    {
        title: 'IJJI Tracker',
        description: 'EAS builds and store submissions.',
    },
];

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** The site's card shape: rounded on the left, the top-right corner cut, as on InfoCard. */
const frame = 'h-full bg-neutral-100 transition-colors';
const card = 'flex flex-col gap-2 p-6 md:p-8 h-full';

/** Deletion requests at a glance: how many are open, and how long the next one has. */
const DeletionRequestsCard = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const open = deletions?.requests.filter((r) => OPEN.includes(r.status)) ?? [];
    const next = open.length ? Math.min(...open.map((r) => daysLeft(r, deletions!.now))) : null;

    return (
        // The link wraps the frame, so its focus ring isn't clipped by the cut corner.
        <Link to={adminPaths.deletionRequests} className='group block h-full'>
            <ArtisticFrame
                cutSize={28}
                className={clsx(
                    frame,
                    next !== null && urgency(next) === 'urgent'
                        ? 'bg-red-100 group-hover:bg-red-200'
                        : 'group-hover:bg-brand-primary group-focus-visible:bg-brand-primary',
                )}
            >
                <div className={card}>
                    <h2 className='text-lg font-bold flex items-center justify-between gap-4'>
                        Deletion requests
                        <span
                            aria-hidden='true'
                            className='transition-transform group-hover:translate-x-1'
                        >
                            →
                        </span>
                    </h2>
                    {!deletions ? (
                        <p className='text-neutral-600'>
                            Couldn’t load them. Open the page to try again.
                        </p>
                    ) : (
                        <>
                            <p className='text-3xl font-extrabold'>{open.length} open</p>
                            <p className='text-neutral-700'>
                                {next === null
                                    ? 'Nothing to do.'
                                    : `The next: ${describeDaysLeft(next).toLowerCase()}.`}
                            </p>
                        </>
                    )}
                </div>
            </ArtisticFrame>
        </Link>
    );
};

/** The website at a glance: are the pages up, the last deploy, the home page's mobile score. */
const WebsiteCard = () => {
    const { website } = useLoaderData() as OverviewData;
    const checks = website?.uptime.data?.filter((c) => c.latest) ?? [];
    const down = checks.filter((c) => !c.latest!.ok);
    const deploy = website?.deploys.data?.[0];
    const performance =
        website?.lighthouse.data?.find((r) => r.path === '/' && r.strategy === 'mobile')?.latest
            ?.scores.performance ?? null;

    return (
        <Link to={adminPaths.website} className='group block h-full'>
            <ArtisticFrame
                cutSize={28}
                className={clsx(
                    frame,
                    down.length
                        ? 'bg-red-100 group-hover:bg-red-200'
                        : 'group-hover:bg-brand-primary group-focus-visible:bg-brand-primary',
                )}
            >
                <div className={card}>
                    <h2 className='text-lg font-bold flex items-center justify-between gap-4'>
                        Website
                        <span
                            aria-hidden='true'
                            className='transition-transform group-hover:translate-x-1'
                        >
                            →
                        </span>
                    </h2>
                    {!website ? (
                        <p className='text-neutral-700'>
                            Couldn’t load it. Open the page to try again.
                        </p>
                    ) : (
                        <ul className='flex flex-col gap-2 text-neutral-800'>
                            <li className='flex flex-wrap items-center gap-2'>
                                {!checks.length ? (
                                    <StatusBadge level='neutral' label='Not checked yet' />
                                ) : down.length ? (
                                    <StatusBadge level='critical' label={`${down.length} down`} />
                                ) : (
                                    <StatusBadge level='good' label='All up' />
                                )}
                                <span>Key pages</span>
                            </li>
                            {deploy && (
                                <li className='flex flex-wrap items-center gap-2'>
                                    <StatusBadge {...deployStatus(deploy.state)} />
                                    <span>Last deploy</span>
                                </li>
                            )}
                            {performance !== null && (
                                <li className='flex flex-wrap items-center gap-2'>
                                    <StatusBadge
                                        level={scoreLevel(performance)}
                                        label={`${performance} · ${SCORE_LABELS[scoreLevel(performance)]}`}
                                    />
                                    <span>Mobile performance</span>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </ArtisticFrame>
        </Link>
    );
};

/** Production Supabase at a glance: is it up, how many people, anything the advisor flags. */
const SupabaseCard = () => {
    const { supabase } = useLoaderData() as OverviewData;
    const project = supabase?.project.data;
    const usage = supabase?.usage.data;
    const flagged = supabase?.security.data?.filter((lint) => lint.level !== 'INFO') ?? [];
    const state = project ? projectState(project.status) : null;
    const urgent = state?.level === 'critical' || flagged.some((lint) => lint.level === 'ERROR');

    return (
        <Link to={adminPaths.supabase} className='group block h-full'>
            <ArtisticFrame
                cutSize={28}
                className={clsx(
                    frame,
                    urgent
                        ? 'bg-red-100 group-hover:bg-red-200'
                        : 'group-hover:bg-brand-primary group-focus-visible:bg-brand-primary',
                )}
            >
                <div className={card}>
                    <h2 className='text-lg font-bold flex items-center justify-between gap-4'>
                        Supabase
                        <span
                            aria-hidden='true'
                            className='transition-transform group-hover:translate-x-1'
                        >
                            →
                        </span>
                    </h2>
                    {!supabase ? (
                        <p className='text-neutral-700'>
                            Couldn’t load it. Open the page to try again.
                        </p>
                    ) : (
                        <ul className='flex flex-col gap-2 text-neutral-800'>
                            <li className='flex flex-wrap items-center gap-2'>
                                {state ? (
                                    <StatusBadge {...state} />
                                ) : (
                                    <StatusBadge level='neutral' label='Not set up' />
                                )}
                                <span>Production</span>
                            </li>
                            {usage && (
                                <li>
                                    <span className='font-bold'>
                                        {usage.users.toLocaleString('en-GB')}
                                    </span>{' '}
                                    {usage.users === 1 ? 'account' : 'accounts'},{' '}
                                    {lastDaysOf(usage.signupsByDay, 7).toLocaleString('en-GB')} new
                                    this week
                                </li>
                            )}
                            {supabase.security.data && (
                                <li className='flex flex-wrap items-center gap-2'>
                                    {flagged.length ? (
                                        <StatusBadge
                                            level={
                                                flagged.some((lint) => lint.level === 'ERROR')
                                                    ? 'critical'
                                                    : 'warning'
                                            }
                                            label={`${flagged.length} to look at`}
                                        />
                                    ) : (
                                        <StatusBadge level='good' label='Nothing flagged' />
                                    )}
                                    <span>Security Advisor</span>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </ArtisticFrame>
        </Link>
    );
};

/** The dashboard's home: what needs doing, and the sections still to come. */
export const Overview = () => {
    const { me } = useRouteLoaderData('admin') as AdminData;

    return (
        <>
            <AdminMeta title='Overview' />

            <Section tone='light' spacing='md' labelledBy='overview-title'>
                <h1 id='overview-title' className='text-4xl font-extrabold mb-2'>
                    Overview
                </h1>
                <p className='text-neutral-600 mb-10 flex flex-wrap gap-x-3 gap-y-1'>
                    <span>Signed in until {timeFormat.format(me.expiresAt)}.</span>
                    {/* In the header from sm up. */}
                    <SignOutEverywhere className='sm:hidden font-semibold text-neutral-800' />
                </p>

                {/* Every card the same size: equal columns, and equal rows (auto-rows-fr). */}
                <ul className='grid gap-4 sm:grid-cols-2 auto-rows-fr'>
                    <li>
                        <DeletionRequestsCard />
                    </li>
                    <li>
                        <WebsiteCard />
                    </li>
                    <li>
                        <SupabaseCard />
                    </li>
                    {COMING.map(({ title, description }) => (
                        <li key={title}>
                            <ArtisticFrame cutSize={28} className={frame}>
                                <div className={card}>
                                    <h2 className='text-lg font-bold'>{title}</h2>
                                    <p className='text-neutral-600'>{description}</p>
                                    <p className='text-sm font-semibold text-neutral-600 mt-auto'>
                                        Not set up yet
                                    </p>
                                </div>
                            </ArtisticFrame>
                        </li>
                    ))}
                </ul>
            </Section>
        </>
    );
};
