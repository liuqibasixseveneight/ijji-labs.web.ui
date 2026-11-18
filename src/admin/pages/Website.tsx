import type { ReactNode } from 'react';
import { useLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { eyebrow, panel } from '../components/styles.ts';
import { FormBars, Sparkline, StatusBadge, UptimeStrip } from '../components/website/charts.tsx';
import {
    CATEGORIES,
    CATEGORY_LABELS,
    deployStatus,
    FORM_LABELS,
    lastDays,
    OUTCOME_LABELS,
    OUTCOMES,
    SCORE_LABELS,
    scoreLevel,
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

/** A card with its title, and either its contents or why its data couldn't be loaded. */
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
            <h2 id={id} className='text-xl font-bold'>
                {title}
            </h2>
            <p className='text-sm text-neutral-600 mb-5'>{hint}</p>
            {part.data === null ? (
                <p className='text-neutral-700'>
                    <StatusBadge level='warning' label='Not available' className='mr-2' />
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

/**
 * The website at a glance: whether the key pages (including the store-listed app pages) are
 * up, Lighthouse scores, Netlify deploys and how the forms are used.
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
                            hint='Checked every 10 minutes. Two failures in a row emails you. The app pages are linked from the App Store and Google Play.'
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
                                        <li
                                            key={check.path}
                                            className='py-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                                        >
                                            <div className='min-w-0'>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    {check.latest ? (
                                                        <StatusBadge
                                                            level={
                                                                check.latest.ok
                                                                    ? 'good'
                                                                    : 'critical'
                                                            }
                                                            label={check.latest.ok ? 'Up' : 'Down'}
                                                        />
                                                    ) : (
                                                        <StatusBadge
                                                            level='neutral'
                                                            label='Not checked'
                                                        />
                                                    )}
                                                    <span className='font-semibold'>
                                                        {check.name}
                                                    </span>
                                                </div>
                                                <p className='text-sm text-neutral-600 mt-1'>
                                                    {check.path}
                                                    {check.uptime24h !== null &&
                                                        ` · ${check.uptime24h}% over 24h · ${check.uptime7d}% over 7 days`}
                                                    {check.averageMs24h !== null &&
                                                        ` · ${check.averageMs24h} ms average`}
                                                    {check.latest &&
                                                        !check.latest.ok &&
                                                        ` · last answer: ${check.latest.status || 'none'}`}
                                                </p>
                                            </div>
                                            <UptimeStrip recent={check.recent} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <Card
                            id='lighthouse-title'
                            title='Lighthouse'
                            hint='Run daily from 03:00 UTC with PageSpeed Insights. 90 and over is good.'
                            part={website.lighthouse}
                            empty={(rows) =>
                                rows.every((r) => !r.latest)
                                    ? 'No scores yet: the first runs at 03:00 UTC.'
                                    : null
                            }
                        >
                            {(rows) => (
                                <div className='overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0'>
                                    <table className='w-full min-w-[40rem] text-sm'>
                                        <thead>
                                            <tr className='text-left'>
                                                <th scope='col' className={clsx(eyebrow, 'pb-2')}>
                                                    Page
                                                </th>
                                                {CATEGORIES.map((c) => (
                                                    <th
                                                        key={c}
                                                        scope='col'
                                                        className={clsx(eyebrow, 'pb-2')}
                                                    >
                                                        {CATEGORY_LABELS[c]}
                                                    </th>
                                                ))}
                                                <th scope='col' className={clsx(eyebrow, 'pb-2')}>
                                                    Performance, 30 days
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-neutral-200'>
                                            {rows.map((row) => (
                                                <tr key={`${row.path}-${row.strategy}`}>
                                                    <th
                                                        scope='row'
                                                        className='py-3 pr-4 text-left font-semibold'
                                                    >
                                                        {row.page}
                                                        <span className='block text-xs font-normal text-neutral-600'>
                                                            {row.strategy === 'mobile'
                                                                ? 'Mobile'
                                                                : 'Desktop'}
                                                            {row.latest && ` · ${row.latest.date}`}
                                                        </span>
                                                    </th>
                                                    {CATEGORIES.map((c) => {
                                                        const score = row.latest?.scores[c] ?? null;
                                                        return (
                                                            <td key={c} className='py-3 pr-4'>
                                                                {score === null ? (
                                                                    <span className='text-neutral-600'>
                                                                        —
                                                                    </span>
                                                                ) : (
                                                                    <span className='flex flex-col items-start gap-1'>
                                                                        <span className='text-lg font-bold'>
                                                                            {score}
                                                                        </span>
                                                                        <StatusBadge
                                                                            level={scoreLevel(
                                                                                score,
                                                                            )}
                                                                            label={
                                                                                SCORE_LABELS[
                                                                                    scoreLevel(
                                                                                        score,
                                                                                    )
                                                                                ]
                                                                            }
                                                                        />
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='py-3'>
                                                        <Sparkline
                                                            label={`${row.page}, ${row.strategy}, performance over 30 days`}
                                                            values={row.history
                                                                .map((e) => e.scores.performance)
                                                                .filter(
                                                                    (v): v is number => v !== null,
                                                                )}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
                                    {deploys.map((deploy) => {
                                        const status = deployStatus(deploy.state);
                                        return (
                                            <li
                                                key={deploy.id}
                                                className='py-3 flex flex-col gap-1'
                                            >
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    <StatusBadge
                                                        level={status.level}
                                                        label={status.label}
                                                    />
                                                    <a
                                                        href={deploy.adminUrl}
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='font-semibold hover:underline underline-offset-4 [overflow-wrap:anywhere]'
                                                    >
                                                        {deploy.title ??
                                                            deploy.commitRef?.slice(0, 7) ??
                                                            deploy.id}
                                                        <span className='sr-only'>
                                                            {' '}
                                                            (opens Netlify in a new tab)
                                                        </span>
                                                    </a>
                                                </div>
                                                <p className='text-sm text-neutral-600'>
                                                    {[
                                                        deploy.context.replace(/-/g, ' '),
                                                        deploy.branch,
                                                        deploy.commitRef?.slice(0, 7),
                                                        dateTime.format(new Date(deploy.createdAt)),
                                                        deploy.deployTime !== null &&
                                                            `${deploy.deployTime}s`,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                                {deploy.errorMessage && (
                                                    <p className='text-sm text-red-800'>
                                                        {deploy.errorMessage}
                                                    </p>
                                                )}
                                            </li>
                                        );
                                    })}
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
                                            <div key={form} className='flex flex-col gap-4'>
                                                <h3 className='font-bold'>{FORM_LABELS[form]}</h3>
                                                <dl className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                                    {OUTCOMES.map((outcome) => (
                                                        <div key={outcome}>
                                                            <dt className={eyebrow}>
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
