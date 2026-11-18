import { useLoaderData } from 'react-router-dom';

import type { Loaded } from '../cache.ts';
import { Deferred } from '../components/Deferred.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
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
        id: 'uptime-title',
        title: 'Uptime',
        hint: 'Checked every 10 minutes; two failures in a row emails you. The app pages are linked from the App Store and Google Play.',
    },
    lighthouse: {
        id: 'lighthouse-title',
        title: 'Lighthouse',
        hint: 'Run daily from 03:00 UTC with PageSpeed Insights, or now. 90 and over is good; the timings show why a score moved.',
    },
    deploys: {
        id: 'deploys-title',
        title: 'Deploys',
        hint: 'The last 20 Netlify deploys of this site, newest first.',
    },
    forms: {
        id: 'forms-title',
        title: 'Forms',
        hint: 'Posts per day over 30 days. Counts only: nothing about who sent them is kept.',
    },
};

const CARD_IDS = Object.values(CARDS).map((card) => card.id);

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
                <PageHeader
                    id='website-title'
                    title='Website'
                    lede='ijji-labs.com: uptime, Lighthouse, deploys and forms.'
                    loaded={loaded}
                    cacheKey='website'
                    cardIds={CARD_IDS}
                />
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
                                        {...CARDS.uptime}
                                        part={website.uptime}
                                        summary={(checks) => {
                                            const down = checks.filter(
                                                (c) => c.latest && !c.latest.ok,
                                            ).length;
                                            return down
                                                ? `${down} of ${checks.length} down`
                                                : `All ${checks.length} up`;
                                        }}
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
                                        {...CARDS.lighthouse}
                                        part={website.lighthouse}
                                        summary={(rows) => {
                                            const home = rows.find(
                                                (r) => r.path === '/' && r.strategy === 'mobile',
                                            )?.latest?.scores.performance;
                                            return home === undefined || home === null
                                                ? null
                                                : `Home on mobile: performance ${home}`;
                                        }}
                                    >
                                        {(rows) => (
                                            <LighthouseResults rows={rows} now={website.now} />
                                        )}
                                    </Card>

                                    <Card
                                        {...CARDS.deploys}
                                        part={website.deploys}
                                        summary={(deploys) =>
                                            deploys[0]
                                                ? `Last: ${deployStatus(deploys[0].state).label.toLowerCase()}, ${dateTime.format(new Date(deploys[0].createdAt))}`
                                                : null
                                        }
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
                                                                className='link-highlight link-marked'
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

                                    <Card
                                        {...CARDS.forms}
                                        part={website.forms}
                                        summary={(stats) => {
                                            const posts = (['contact', 'account-deletion'] as const)
                                                .map((form) =>
                                                    sum(lastDays(stats.forms[form].byDay, 30)),
                                                )
                                                .reduce((a, b) => a + b, 0);
                                            return `${posts} ${posts === 1 ? 'post' : 'posts'} in 30 days`;
                                        }}
                                    >
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
