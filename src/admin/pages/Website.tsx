import type { ReactNode } from 'react';
import { useLoaderData } from 'react-router-dom';

import type { Loaded } from '../cache.ts';
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

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { Card } from '../components/Card.tsx';
import { panel } from '../components/styles.ts';
import { FormBars, StatusBadge, UptimeStrip } from '../components/website/charts.tsx';
import { LighthouseResults } from '../components/website/Lighthouse.tsx';
import { Row } from '../components/website/Row.tsx';
import {
    deployStatus,
    FORM_LABELS,
    lastDays,
    OUTCOME_LABELS,
    OUTCOMES,
    sum,
    type Website as WebsiteData,
} from '../website.ts';

const dateTime = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

/** Each card's title and what it shows: on the card, and on its skeleton while it loads. */
const CARDS = {
    uptime: {
        title: 'Uptime',
        hint: 'Checked every 10 minutes; two failures in a row emails you. The app pages are linked from the App Store and Google Play.',
    },
    lighthouse: {
        title: 'Lighthouse',
        hint: 'Run daily from 03:00 UTC with PageSpeed Insights, or now. 90 and over is good; the timings show why a score moved.',
    },
    deploys: { title: 'Deploys', hint: 'The last 20 Netlify deploys of this site, newest first.' },
    forms: {
        title: 'Forms',
        hint: 'Posts per day over 30 days. Counts only: nothing about who sent them is kept.',
    },
};

/** The page as it will look, while its data loads the first time. */
const WebsiteSkeleton = () => (
    <div className='flex flex-col gap-6'>
        <LoadingStatus>Loading the website’s data…</LoadingStatus>
        <SkeletonCard {...CARDS.uptime}>
            <SkeletonRows count={3} aside />
        </SkeletonCard>
        <SkeletonCard {...CARDS.lighthouse}>
            <div className='grid gap-3 md:grid-cols-2'>
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className='rounded-2xl bg-neutral-50 border border-neutral-200 p-4 sm:p-5 flex items-center gap-5'
                    >
                        <Bone className='h-20 w-20 rounded-full shrink-0' />
                        <div className='flex-1 flex flex-col gap-2.5'>
                            <Bone className='h-4 w-full' />
                            <Bone className='h-4 w-full' />
                            <Bone className='h-4 w-3/4' />
                        </div>
                    </div>
                ))}
            </div>
        </SkeletonCard>
        <SkeletonCard {...CARDS.deploys}>
            <SkeletonRows count={4} />
        </SkeletonCard>
        <SkeletonCard {...CARDS.forms}>
            <div className='grid gap-8 lg:grid-cols-2'>
                {[0, 1].map((i) => (
                    <div key={i} className='flex flex-col gap-4'>
                        <Bone className='h-5 w-24' />
                        <SkeletonTiles count={4} />
                        <SkeletonBars />
                    </div>
                ))}
            </div>
        </SkeletonCard>
    </div>
);

/** The page's title, with when its data is from and a refresh beside it. */
const Header = ({ aside }: { aside: ReactNode }) => (
    <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 mb-8'>
        <div>
            <h1 id='website-title' className='text-3xl sm:text-4xl font-extrabold mb-2'>
                Website
            </h1>
            <p className='text-neutral-600'>
                ijji-labs.com: uptime, Lighthouse, deploys and forms.
            </p>
        </div>
        {aside}
    </div>
);

/** A tile's label: tighter than the eyebrow, so "Accessibility" fits a phone-width tile. */
const tileLabel = 'text-[11px] font-bold tracking-wide uppercase text-neutral-600';

/**
 * The website at a glance: whether the key pages (including the store-listed app pages) are
 * up, Lighthouse scores and timings, Netlify deploys and how the forms are used.
 */
export const Website = () => {
    const loaded = useLoaderData() as Loaded<WebsiteData>;

    return (
        <>
            <AdminMeta title='Website' />
            <Section tone='light' spacing='md' labelledBy='website-title'>
                <Header aside={<Refresh loaded={loaded} cacheKey='website' />} />
                <Deferred loaded={loaded} fallback={<WebsiteSkeleton />}>
                    {(website) => (
                        <>
                            {!website ? (
                                <p className={panel}>
                                    Couldn’t load the website’s data. Refresh to try again.
                                </p>
                            ) : (
                                <div className='flex flex-col gap-6'>
                                    <Card
                                        id='uptime-title'
                                        {...CARDS.uptime}
                                        part={website.uptime}
                                        empty={(checks) =>
                                            checks.every((c) => !c.latest)
                                                ? 'No checks yet: the first runs within 10 minutes of deploying.'
                                                : null
                                        }
                                    >
                                        {(checks) => (
                                            <ul className='divide-y divide-neutral-200'>
                                                {checks.map((check) => (
                                                    <Row
                                                        key={check.path}
                                                        badge={
                                                            check.latest ? (
                                                                <StatusBadge
                                                                    level={
                                                                        check.latest.ok
                                                                            ? 'good'
                                                                            : 'critical'
                                                                    }
                                                                    label={
                                                                        check.latest.ok
                                                                            ? 'Up'
                                                                            : 'Down'
                                                                    }
                                                                />
                                                            ) : (
                                                                <StatusBadge
                                                                    level='neutral'
                                                                    label='Not checked'
                                                                />
                                                            )
                                                        }
                                                        title={check.name}
                                                        meta={[
                                                            check.path,
                                                            check.uptime24h !== null &&
                                                                `${check.uptime24h}% over 24h`,
                                                            check.uptime7d !== null &&
                                                                `${check.uptime7d}% over 7 days`,
                                                            check.averageMs24h !== null &&
                                                                `${check.averageMs24h} ms average`,
                                                            check.latest &&
                                                                !check.latest.ok &&
                                                                `last answer: ${check.latest.status || 'none'}`,
                                                        ]}
                                                        aside={
                                                            <UptimeStrip recent={check.recent} />
                                                        }
                                                    />
                                                ))}
                                            </ul>
                                        )}
                                    </Card>

                                    <Card
                                        id='lighthouse-title'
                                        {...CARDS.lighthouse}
                                        part={website.lighthouse}
                                    >
                                        {(rows) => (
                                            <LighthouseResults rows={rows} now={website.now} />
                                        )}
                                    </Card>

                                    <Card
                                        id='deploys-title'
                                        {...CARDS.deploys}
                                        part={website.deploys}
                                        empty={(deploys) =>
                                            deploys.length ? null : 'No deploys yet.'
                                        }
                                    >
                                        {(deploys) => (
                                            <ol className='divide-y divide-neutral-200'>
                                                {deploys.map((deploy) => (
                                                    <Row
                                                        key={deploy.id}
                                                        badge={
                                                            <StatusBadge
                                                                {...deployStatus(deploy.state)}
                                                            />
                                                        }
                                                        title={
                                                            <a
                                                                href={deploy.adminUrl}
                                                                target='_blank'
                                                                rel='noreferrer'
                                                                className='hover:underline underline-offset-4'
                                                            >
                                                                {deploy.title ??
                                                                    deploy.commitRef?.slice(0, 7) ??
                                                                    deploy.id}
                                                                <span className='sr-only'>
                                                                    {' '}
                                                                    (opens Netlify in a new tab)
                                                                </span>
                                                            </a>
                                                        }
                                                        meta={[
                                                            deploy.context.replace(/-/g, ' '),
                                                            deploy.branch,
                                                            deploy.commitRef?.slice(0, 7),
                                                            dateTime.format(
                                                                new Date(deploy.createdAt),
                                                            ),
                                                            deploy.deployTime !== null &&
                                                                `${deploy.deployTime}s`,
                                                        ]}
                                                    >
                                                        {deploy.errorMessage && (
                                                            <p className='text-sm text-red-800 [overflow-wrap:anywhere]'>
                                                                {deploy.errorMessage}
                                                            </p>
                                                        )}
                                                    </Row>
                                                ))}
                                            </ol>
                                        )}
                                    </Card>

                                    <Card id='forms-title' {...CARDS.forms} part={website.forms}>
                                        {(stats) => (
                                            <div className='grid gap-8 lg:grid-cols-2'>
                                                {(['contact', 'account-deletion'] as const).map(
                                                    (form) => {
                                                        const { byDay } = stats.forms[form];
                                                        const week = lastDays(byDay, 7);
                                                        const month = lastDays(byDay, 30);
                                                        return (
                                                            <div
                                                                key={form}
                                                                className='flex flex-col gap-4 min-w-0'
                                                            >
                                                                <h3 className='font-bold'>
                                                                    {FORM_LABELS[form]}
                                                                </h3>
                                                                <dl className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                                                    {OUTCOMES.map((outcome) => (
                                                                        <div
                                                                            key={outcome}
                                                                            className='rounded-xl bg-neutral-50 border border-neutral-200 p-3'
                                                                        >
                                                                            <dt
                                                                                className={
                                                                                    tileLabel
                                                                                }
                                                                            >
                                                                                {
                                                                                    OUTCOME_LABELS[
                                                                                        outcome
                                                                                    ]
                                                                                }
                                                                            </dt>
                                                                            <dd className='text-2xl font-extrabold'>
                                                                                {week[outcome]}
                                                                            </dd>
                                                                            <dd className='text-xs text-neutral-600'>
                                                                                {month[outcome]} in
                                                                                30 days
                                                                            </dd>
                                                                        </div>
                                                                    ))}
                                                                </dl>
                                                                <p className='text-xs text-neutral-600 -mt-2'>
                                                                    Last 7 days; {sum(month)} posts
                                                                    in 30 days.
                                                                </p>
                                                                <FormBars
                                                                    form={form}
                                                                    days={stats.days}
                                                                    byDay={byDay}
                                                                />
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </Deferred>
            </Section>
        </>
    );
};
