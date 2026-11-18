import { useLoaderData } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import {
    buildStatus,
    duration,
    latestBuilds,
    PLATFORM_LABELS,
    PLATFORMS,
    PROFILES,
    submissionStatus,
    version,
    type AppData,
    type Build,
} from '../app.ts';
import type { Loaded } from '../cache.ts';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { Card } from '../components/Card.tsx';
import { Deferred } from '../components/Deferred.tsx';
import { OpenIn } from '../components/OpenIn.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { Bone, LoadingStatus, SkeletonCard, SkeletonRows } from '../components/Skeleton.tsx';
import { panel } from '../components/styles.ts';
import { StatusBadge } from '../components/website/charts.tsx';
import { Row } from '../components/website/Row.tsx';

const dateTime = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});
const when = (iso: string) => dateTime.format(new Date(iso));

/** Each card's id, title and what it shows: on the card, and on its skeleton. */
const CARDS = {
    latest: {
        id: 'latest-title',
        title: 'Latest builds',
        hint: 'The newest EAS build of each profile, on iOS and Android.',
    },
    builds: {
        id: 'builds-title',
        title: 'Recent builds',
        hint: 'The last 30 EAS builds, newest first, with the commit each was built from.',
    },
    submissions: {
        id: 'submissions-title',
        title: 'Store submissions',
        hint: 'The last 10 submissions to the App Store and Google Play.',
    },
};
const CARD_IDS = Object.values(CARDS).map((card) => card.id);

/** A link to a build or submission on expo.dev, in the policy pages' link style. */
const ExpoLink = ({ href, children }: { href: string; children: string }) => (
    <a href={href} target='_blank' rel='noreferrer' className='link-highlight link-marked'>
        {children}
        <span className='sr-only'> (opens Expo in a new tab)</span>
    </a>
);

/** One profile's newest build on each platform. */
const ProfileTile = ({
    profile,
    latest,
}: {
    profile: (typeof PROFILES)[number];
    latest: (profile: string, platform: Build['platform']) => Build | null;
}) => (
    <section
        aria-labelledby={`profile-${profile.id}`}
        className='rounded-2xl bg-neutral-50 border border-neutral-200 p-4 sm:p-5 flex flex-col gap-4 min-w-0'
    >
        <header>
            <h3 id={`profile-${profile.id}`} className='font-bold'>
                {profile.label}
            </h3>
            <p className='text-xs text-neutral-600 mt-0.5'>{profile.what}</p>
        </header>
        <dl className='flex flex-col divide-y divide-neutral-200'>
            {PLATFORMS.map((platform) => {
                const build = latest(profile.id, platform);
                return (
                    <div key={platform} className='py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1'>
                        <dt className='text-sm font-semibold'>{PLATFORM_LABELS[platform]}</dt>
                        <dd className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm'>
                            {build ? (
                                <>
                                    <StatusBadge {...buildStatus(build.status)} />
                                    <span className='tabular-nums'>
                                        {version(build.appVersion, build.buildNumber) ?? '—'}
                                    </span>
                                    <span className='text-neutral-600 whitespace-nowrap'>
                                        {when(build.createdAt)}
                                    </span>
                                </>
                            ) : (
                                <span className='text-neutral-600'>No builds yet</span>
                            )}
                        </dd>
                        {build && (
                            <dd className='text-sm'>
                                <ExpoLink href={build.url}>See the build</ExpoLink>
                            </dd>
                        )}
                    </div>
                );
            })}
        </dl>
    </section>
);

/** The page as it will look, while its data loads the first time. */
const AppSkeleton = () => (
    <div className='flex flex-col gap-6'>
        <LoadingStatus>Loading IJJI Tracker’s builds…</LoadingStatus>
        <SkeletonCard {...CARDS.latest}>
            <div className='grid gap-3 md:grid-cols-3'>
                {PROFILES.map((profile) => (
                    <div
                        key={profile.id}
                        className='rounded-2xl bg-neutral-50 border border-neutral-200 p-4 sm:p-5 flex flex-col gap-3'
                    >
                        <Bone className='h-5 w-24' />
                        <Bone className='h-3 w-40 max-w-full' />
                        <Bone className='h-5 w-full' />
                        <Bone className='h-5 w-full' />
                    </div>
                ))}
            </div>
        </SkeletonCard>
        <SkeletonCard {...CARDS.builds}>
            <SkeletonRows count={4} />
        </SkeletonCard>
        <SkeletonCard {...CARDS.submissions}>
            <SkeletonRows count={2} />
        </SkeletonCard>
    </div>
);

/** IJJI Tracker on EAS: the newest build of each profile, recent builds, and store submissions. */
export const IjjiTracker = () => {
    const loaded = useLoaderData() as Loaded<AppData>;

    return (
        <>
            <AdminMeta title='IJJI Tracker' />
            <Section tone='light' spacing='md' labelledBy='app-title'>
                <PageHeader
                    id='app-title'
                    title='IJJI Tracker'
                    lede='EAS builds and store submissions.'
                    loaded={loaded}
                    cacheKey='app'
                    cardIds={CARD_IDS}
                />
                <Deferred loaded={loaded} fallback={<AppSkeleton />}>
                    {(app) =>
                        !app ? (
                            <p className={panel}>
                                Couldn’t load IJJI Tracker’s builds. Refresh to try again.
                            </p>
                        ) : (
                            <div className='flex flex-col gap-6'>
                                <Card
                                    {...CARDS.latest}
                                    part={app.builds}
                                    empty={(builds) => (builds.length ? null : 'No builds yet.')}
                                    summary={(builds) => {
                                        const latest = latestBuilds(builds);
                                        return `Production: ${PLATFORMS.map((platform) => {
                                            const build = latest('production', platform);
                                            return `${PLATFORM_LABELS[platform]} ${build ? buildStatus(build.status).label.toLowerCase() : 'none yet'}`;
                                        }).join(', ')}`;
                                    }}
                                    action={
                                        <OpenIn service='Expo' href={app.projectUrl}>
                                            Open on Expo
                                        </OpenIn>
                                    }
                                >
                                    {(builds) => {
                                        const latest = latestBuilds(builds);
                                        return (
                                            <div className='grid gap-3 md:grid-cols-3'>
                                                {PROFILES.map((profile) => (
                                                    <ProfileTile
                                                        key={profile.id}
                                                        profile={profile}
                                                        latest={latest}
                                                    />
                                                ))}
                                            </div>
                                        );
                                    }}
                                </Card>

                                <Card
                                    {...CARDS.builds}
                                    part={app.builds}
                                    empty={(builds) => (builds.length ? null : 'No builds yet.')}
                                    summary={(builds) => {
                                        const failed = builds.filter(
                                            (b) => b.status === 'ERRORED',
                                        ).length;
                                        return `${builds.length} builds${failed ? `, ${failed} failed` : ''}`;
                                    }}
                                >
                                    {(builds) => (
                                        <ol className='divide-y divide-neutral-200'>
                                            {builds.map((build) => (
                                                <Row
                                                    key={build.id}
                                                    badge={
                                                        <StatusBadge
                                                            {...buildStatus(build.status)}
                                                        />
                                                    }
                                                    title={
                                                        <ExpoLink href={build.url}>
                                                            {`${PROFILES.find((p) => p.id === build.profile)?.label ?? build.profile} · ${PLATFORM_LABELS[build.platform]}${build.simulator ? ' simulator' : ''}`}
                                                        </ExpoLink>
                                                    }
                                                    meta={[
                                                        version(
                                                            build.appVersion,
                                                            build.buildNumber,
                                                        ),
                                                        when(build.createdAt),
                                                        duration(build),
                                                        build.commit &&
                                                            [build.commit, build.commitMessage]
                                                                .filter(Boolean)
                                                                .join(' '),
                                                    ]}
                                                >
                                                    {build.error && (
                                                        <p className='text-sm text-red-800 [overflow-wrap:anywhere]'>
                                                            {build.error}
                                                        </p>
                                                    )}
                                                </Row>
                                            ))}
                                        </ol>
                                    )}
                                </Card>

                                <Card
                                    {...CARDS.submissions}
                                    part={app.submissions}
                                    empty={(submissions) =>
                                        submissions.length ? null : 'Nothing submitted yet.'
                                    }
                                    summary={(submissions) =>
                                        submissions[0]
                                            ? `Last: ${PLATFORM_LABELS[submissions[0].platform]}, ${submissionStatus(submissions[0].status).label.toLowerCase()}`
                                            : null
                                    }
                                >
                                    {(submissions) => (
                                        <ol className='divide-y divide-neutral-200'>
                                            {submissions.map((submission) => (
                                                <Row
                                                    key={submission.id}
                                                    badge={
                                                        <StatusBadge
                                                            {...submissionStatus(submission.status)}
                                                        />
                                                    }
                                                    title={
                                                        <ExpoLink href={submission.url}>
                                                            {`${submission.platform === 'IOS' ? 'App Store' : 'Google Play'}${version(submission.appVersion, submission.buildNumber) ? ` · ${version(submission.appVersion, submission.buildNumber)}` : ''}`}
                                                        </ExpoLink>
                                                    }
                                                    meta={[when(submission.createdAt)]}
                                                >
                                                    {submission.error && (
                                                        <p className='text-sm text-red-800 [overflow-wrap:anywhere]'>
                                                            {submission.error}
                                                        </p>
                                                    )}
                                                </Row>
                                            ))}
                                        </ol>
                                    )}
                                </Card>
                            </div>
                        )
                    }
                </Deferred>
            </Section>
        </>
    );
};
