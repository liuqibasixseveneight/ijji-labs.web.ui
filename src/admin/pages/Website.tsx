import type { ReactNode } from 'react';
import { useLoaderData } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
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
    type Part,
    type Website as WebsiteData,
} from '../website.ts';

const dateTime = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * A card on the page: its title, a line on what it shows, and either its contents or why its
 * data couldn't be had. Every card on the page is built from this, so they all look alike.
 */
const Card = <T,>({
    id,
    title,
    hint,
    part,
    empty,
    children,
}: {
    id: string;
    title: string;
    hint: string;
    part: Part<T>;
    empty?: (data: T) => string | null;
    children: (data: T) => ReactNode;
}) => {
    const emptyMessage = part.data !== null && empty ? empty(part.data) : null;
    return (
        <section aria-labelledby={id} className={panel}>
            <header className='mb-5 pb-4 border-b border-neutral-200'>
                <h2 id={id} className='text-xl font-bold'>
                    {title}
                </h2>
                <p className='text-sm text-neutral-600 mt-1'>{hint}</p>
            </header>
            {part.data === null ? (
                <p className='flex flex-wrap items-center gap-2 text-neutral-700'>
                    <StatusBadge level='warning' label='Not available' />
                    {part.error}
                </p>
            ) : emptyMessage ? (
                <p className='text-neutral-600'>{emptyMessage}</p>
            ) : (
                children(part.data)
            )}
        </section>
    );
};

/** A tile's label: tighter than the eyebrow, so "Accessibility" fits a phone-width tile. */
const tileLabel = 'text-[11px] font-bold tracking-wide uppercase text-neutral-600';

/**
 * The website at a glance: whether the key pages (including the store-listed app pages) are
 * up, Lighthouse scores and timings, Netlify deploys and how the forms are used.
 */
export const Website = () => {
    const website = useLoaderData() as WebsiteData | null;

    return (
        <>
            <AdminMeta title='Website' />
            <Section tone='light' spacing='md' labelledBy='website-title'>
                <h1 id='website-title' className='text-3xl sm:text-4xl font-extrabold mb-2'>
                    Website
                </h1>
                <p className='text-neutral-600 mb-8'>
                    ijji-labs.com: uptime, Lighthouse, deploys and forms.
                </p>

                {!website ? (
                    <p className={panel}>Couldn’t load the website’s data. Reload to try again.</p>
                ) : (
                    <div className='flex flex-col gap-6'>
                        <Card
                            id='uptime-title'
                            title='Uptime'
                            hint='Checked every 10 minutes; two failures in a row emails you. The app pages are linked from the App Store and Google Play.'
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
                                                            check.latest.ok ? 'good' : 'critical'
                                                        }
                                                        label={check.latest.ok ? 'Up' : 'Down'}
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
                                            aside={<UptimeStrip recent={check.recent} />}
                                        />
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <Card
                            id='lighthouse-title'
                            title='Lighthouse'
                            hint='Run daily from 03:00 UTC with PageSpeed Insights. 90 and over is good; the timings show why a score moved.'
                            part={website.lighthouse}
                            empty={(rows) =>
                                rows.every((r) => !r.latest)
                                    ? 'No scores yet: the first runs at 03:00 UTC.'
                                    : null
                            }
                        >
                            {(rows) => <LighthouseResults rows={rows} />}
                        </Card>

                        <Card
                            id='deploys-title'
                            title='Deploys'
                            hint='The last 20 Netlify deploys of this site, newest first.'
                            part={website.deploys}
                            empty={(deploys) => (deploys.length ? null : 'No deploys yet.')}
                        >
                            {(deploys) => (
                                <ol className='divide-y divide-neutral-200'>
                                    {deploys.map((deploy) => (
                                        <Row
                                            key={deploy.id}
                                            badge={<StatusBadge {...deployStatus(deploy.state)} />}
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
                                                dateTime.format(new Date(deploy.createdAt)),
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
                            id='forms-title'
                            title='Forms'
                            hint='Posts per day over 30 days. Counts only: nothing about who sent them is kept.'
                            part={website.forms}
                        >
                            {(stats) => (
                                <div className='grid gap-8 lg:grid-cols-2'>
                                    {(['contact', 'account-deletion'] as const).map((form) => {
                                        const { byDay } = stats.forms[form];
                                        const week = lastDays(byDay, 7);
                                        const month = lastDays(byDay, 30);
                                        return (
                                            <div key={form} className='flex flex-col gap-4 min-w-0'>
                                                <h3 className='font-bold'>{FORM_LABELS[form]}</h3>
                                                <dl className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                                    {OUTCOMES.map((outcome) => (
                                                        <div
                                                            key={outcome}
                                                            className='rounded-xl bg-neutral-50 border border-neutral-200 p-3'
                                                        >
                                                            <dt className={tileLabel}>
                                                                {OUTCOME_LABELS[outcome]}
                                                            </dt>
                                                            <dd className='text-2xl font-extrabold'>
                                                                {week[outcome]}
                                                            </dd>
                                                            <dd className='text-xs text-neutral-600'>
                                                                {month[outcome]} in 30 days
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                                <p className='text-xs text-neutral-600 -mt-2'>
                                                    Last 7 days; {sum(month)} posts in 30 days.
                                                </p>
                                                <FormBars
                                                    form={form}
                                                    days={stats.days}
                                                    byDay={byDay}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </Section>
        </>
    );
};
