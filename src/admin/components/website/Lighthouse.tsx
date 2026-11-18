import { useEffect, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { clsx } from 'clsx';

import { runLighthouse } from '../../api.ts';
import { invalidate } from '../../cache.ts';
import { secondaryAction } from '../styles.ts';
import {
    CATEGORIES,
    CATEGORY_LABELS,
    describeMetrics,
    SCORE_LABELS,
    scoreLevel,
    type LighthouseRow,
} from '../../website.ts';

// The Lighthouse card's contents: one block per page, mobile and desktop inside it. Built to
// read well on a phone first: a score ring for performance (as Lighthouse shows it), the other
// categories as a list, the timings in plain words, and the 30-day trend as a line.

/** Ring and icon colours per band. Amber is darkened from the status step to clear 3:1 on white. */
const BAND = {
    good: { ring: '#0ca30c', text: 'text-green-800', icon: '✓' },
    warning: { ring: '#c27803', text: 'text-amber-800', icon: '!' },
    critical: { ring: '#d03b3b', text: 'text-red-800', icon: '✕' },
} as const;

const dayTime = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** A run started from the dashboard: going, or failed with why. Gone once it's done. */
type RunState = { status: 'running' } | { status: 'failed'; error: string };

const Spinner = () => (
    <svg aria-hidden='true' viewBox='0 0 24 24' className='w-4 h-4 animate-spin' fill='none'>
        <circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='3' opacity='0.25' />
        <path
            d='M21 12a9 9 0 0 0-9-9'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
        />
    </svg>
);

const RunIcon = () => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M21 12a9 9 0 1 1-2.64-6.36' />
        <path d='M21 4v5h-5' />
    </svg>
);

/** A score as Lighthouse draws it: a ring filled to the score, the number inside, the band below. */
export const ScoreRing = ({ score, label }: { score: number | null; label: string }) => {
    const size = 80;
    const stroke = 7;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const level = score === null ? null : scoreLevel(score);

    return (
        <figure
            aria-label={`${label} ${score ?? 'not run'}${level ? `, ${SCORE_LABELS[level].toLowerCase()}` : ''}`}
            className='flex flex-col items-center gap-2 shrink-0'
        >
            <div className='relative' style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    aria-hidden='true'
                    className='-rotate-90'
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill='none'
                        stroke='#e8e7e2'
                        strokeWidth={stroke}
                    />
                    {score !== null && level && (
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill='none'
                            stroke={BAND[level].ring}
                            strokeWidth={stroke}
                            strokeLinecap='round'
                            strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                        />
                    )}
                </svg>
                <span className='absolute inset-0 flex items-center justify-center text-3xl font-extrabold tabular-nums'>
                    {score ?? '—'}
                </span>
            </div>
            <figcaption className='text-center leading-tight'>
                <span className='block text-sm font-semibold'>{label}</span>
                {level && (
                    <span className={clsx('block text-xs font-bold', BAND[level].text)}>
                        <span aria-hidden='true'>{BAND[level].icon} </span>
                        {SCORE_LABELS[level]}
                    </span>
                )}
            </figcaption>
        </figure>
    );
};

/** The 30-day performance line: full width, with the lowest and highest values named. */
const Trend = ({ values, label }: { values: number[]; label: string }) => {
    if (values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Scaled to the range, with a little room, so small changes are visible.
    const low = Math.max(0, min - 5);
    const high = Math.min(100, max + 5);
    const points = values
        .map((value, i) => {
            const x = (i / (values.length - 1)) * 100;
            const y = 30 - ((value - low) / Math.max(1, high - low)) * 28 - 1;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <figure className='flex flex-col gap-1.5'>
            <svg
                role='img'
                aria-label={`${label}: ${values.join(', ')}`}
                viewBox='0 0 100 30'
                preserveAspectRatio='none'
                className='w-full h-10'
            >
                <title>{`${label}: ${values.join(', ')}`}</title>
                <polyline
                    points={points}
                    fill='none'
                    stroke='#2a78d6'
                    strokeWidth='2'
                    strokeLinejoin='round'
                    strokeLinecap='round'
                    vectorEffect='non-scaling-stroke'
                />
            </svg>
            <figcaption className='flex justify-between text-xs text-neutral-600'>
                <span>Performance, {values.length} days</span>
                <span className='tabular-nums'>{min === max ? `${min}` : `${min}–${max}`}</span>
            </figcaption>
        </figure>
    );
};

const DEVICE_ICONS = {
    mobile: (
        <svg
            aria-hidden='true'
            viewBox='0 0 24 24'
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
        >
            <rect x='7' y='2' width='10' height='20' rx='2' />
            <path d='M11 18h2' strokeLinecap='round' />
        </svg>
    ),
    desktop: (
        <svg
            aria-hidden='true'
            viewBox='0 0 24 24'
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
        >
            <rect x='2' y='4' width='20' height='13' rx='2' />
            <path d='M8 21h8M12 17v4' strokeLinecap='round' />
        </svg>
    ),
};

/** One page on one device: the ring, the other scores, the timings and the trend. */
const DevicePanel = ({
    row,
    run,
    coolingUntil,
    onRun,
}: {
    row: LighthouseRow;
    run: RunState | undefined;
    /** Can't be run by hand again until then; null if it can. */
    coolingUntil: number | null;
    onRun: () => void;
}) => {
    const running = run?.status === 'running';
    const device = row.strategy === 'mobile' ? 'Mobile' : 'Desktop';
    const timings = describeMetrics(row.latest?.metrics);
    const trend = row.history
        .map((entry) => entry.scores.performance)
        .filter((value): value is number => value !== null);

    return (
        <section
            aria-label={`${row.page}, ${device.toLowerCase()}`}
            aria-busy={running || undefined}
            // A container: what's inside lays out by the panel's width, not the screen's (the
            // panels are side by side from md, so a wide screen can still mean a narrow panel).
            className='@container rounded-2xl bg-neutral-50 border border-neutral-200 p-4 sm:p-5 flex flex-col gap-5 min-w-0'
        >
            <header className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                    <h4 className='flex items-center gap-1.5 font-bold'>
                        {DEVICE_ICONS[row.strategy]}
                        {device}
                    </h4>
                    <p className='text-xs text-neutral-600 mt-0.5'>
                        {running ? (
                            'Running now…'
                        ) : row.latest ? (
                            <>
                                Last run{' '}
                                <span className='whitespace-nowrap'>
                                    {dayTime.format(row.latest.at)}
                                </span>
                            </>
                        ) : (
                            'Not run yet'
                        )}
                        {!running && coolingUntil !== null && (
                            <span className='block'>
                                <span className='sr-only'>. </span>Can run again{' '}
                                <span className='whitespace-nowrap'>
                                    from {time.format(coolingUntil)}
                                </span>
                            </span>
                        )}
                    </p>
                </div>
                <button
                    type='button'
                    onClick={onRun}
                    disabled={running || coolingUntil !== null}
                    className={clsx(secondaryAction, 'shrink-0 px-2.5 py-1.5')}
                >
                    {running ? <Spinner /> : <RunIcon />}
                    {/* The space is in the label: jsdom (and some readers) drop one leading the sr-only text. */}
                    {running ? 'Running ' : 'Run '}
                    <span className='sr-only'>
                        {row.page}, {device.toLowerCase()}
                    </span>
                </button>
            </header>

            {run?.status === 'failed' && (
                <p className='text-sm text-red-800 font-medium flex gap-1.5'>
                    <span aria-hidden='true'>✕</span>
                    <span>{run.error}</span>
                </p>
            )}

            {!row.latest ? (
                <p className='text-sm text-neutral-600'>
                    The daily run is at 03:00 UTC, or run it now: it takes about 20 seconds.
                </p>
            ) : (
                <div
                    className={clsx(
                        'flex flex-col gap-5 transition-opacity',
                        running && 'opacity-50',
                    )}
                >
                    <div className='flex flex-col items-stretch gap-4 @[20rem]:flex-row @[20rem]:items-center @[20rem]:gap-5'>
                        <ScoreRing score={row.latest.scores.performance} label='Performance' />
                        <dl className='flex-1 min-w-0 flex flex-col divide-y divide-neutral-200'>
                            {CATEGORIES.filter((c) => c !== 'performance').map((category) => {
                                const score = row.latest!.scores[category];
                                const level = score === null ? null : scoreLevel(score);
                                return (
                                    <div
                                        key={category}
                                        className='flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0'
                                    >
                                        <dt className='text-sm text-neutral-700 whitespace-nowrap'>
                                            {CATEGORY_LABELS[category]}
                                        </dt>
                                        <dd
                                            className={clsx(
                                                'font-bold tabular-nums whitespace-nowrap',
                                                level && BAND[level].text,
                                            )}
                                        >
                                            {level && (
                                                <span aria-hidden='true' className='text-xs mr-1'>
                                                    {BAND[level].icon}
                                                </span>
                                            )}
                                            {score ?? '—'}
                                            {level && (
                                                <span className='sr-only'>
                                                    {' '}
                                                    ({SCORE_LABELS[level].toLowerCase()})
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>

                    {timings.length > 0 && (
                        <div>
                            <h5 className='text-xs font-bold tracking-wide uppercase text-neutral-600 mb-2'>
                                Timings
                            </h5>
                            <dl className='grid grid-cols-1 @[30rem]:grid-cols-2 gap-x-6 gap-y-1.5'>
                                {timings.map((timing) => (
                                    <div
                                        key={timing.label}
                                        className='flex items-baseline justify-between gap-3'
                                    >
                                        <dt className='text-sm text-neutral-700'>
                                            <abbr title={timing.label} className='no-underline'>
                                                {timing.name}
                                            </abbr>
                                        </dt>
                                        <dd
                                            className={clsx(
                                                'text-sm font-semibold tabular-nums whitespace-nowrap',
                                                timing.good ? 'text-neutral-900' : 'text-red-800',
                                            )}
                                        >
                                            {!timing.good && (
                                                <span aria-hidden='true' className='mr-1'>
                                                    ✕
                                                </span>
                                            )}
                                            {timing.value}
                                            {!timing.good && (
                                                <span className='sr-only'> (slow)</span>
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    <Trend
                        values={trend}
                        label={`${row.page}, ${device.toLowerCase()}, performance over ${trend.length} days`}
                    />
                </div>
            )}
        </section>
    );
};

/**
 * Every page's Lighthouse results: a block per page, its mobile and desktop panels side by
 * side from md (stacked on phones), mobile first as that's the one that matters most. Each
 * can be run now, or all at once: they run side by side (about 20 seconds each), and the
 * page reloads its data as each finishes.
 */
export const LighthouseResults = ({ rows, now }: { rows: LighthouseRow[]; now: number }) => {
    const revalidator = useRevalidator();
    const [runs, setRuns] = useState<Record<string, RunState>>({});
    const [message, setMessage] = useState('');
    // The time cool-downs are measured against: the data's, moved on when one ends.
    const [clock, setClock] = useState(now);
    const at = Math.max(now, clock);

    const coolingUntil = (row: LighthouseRow) =>
        row.manualAvailableAt !== null && row.manualAvailableAt > at ? row.manualAvailableAt : null;

    // Wake when the next cool-down ends, so its button comes back without a reload.
    const nextAvailable = Math.min(...rows.map((row) => coolingUntil(row) ?? Infinity));
    useEffect(() => {
        if (!Number.isFinite(nextAvailable)) return;
        const timer = setTimeout(() => setClock(Date.now()), nextAvailable - Date.now() + 500);
        return () => clearTimeout(timer);
    }, [nextAvailable]);

    const running = rows.filter((row) => runs[row.key]?.status === 'running');
    const runnable = rows.filter(
        (row) => runs[row.key]?.status !== 'running' && coolingUntil(row) === null,
    );

    const start = (chosen: LighthouseRow[]) => {
        if (chosen.length === 0) return;
        setRuns((current) => ({
            ...current,
            ...Object.fromEntries(chosen.map((row) => [row.key, { status: 'running' }])),
        }));
        setMessage(
            chosen.length === 1
                ? `Running ${chosen[0].page}, ${chosen[0].strategy}: about 20 seconds.`
                : `Running ${chosen.length} side by side: about 20 seconds.`,
        );

        let failed = 0;
        let left = chosen.length;
        for (const row of chosen) {
            void runLighthouse(row.key).then((outcome) => {
                setRuns((current) => {
                    const next = { ...current };
                    if (outcome.ok) delete next[row.key];
                    else next[row.key] = { status: 'failed', error: outcome.error };
                    return next;
                });
                if (!outcome.ok) failed += 1;
                left -= 1;
                if (left === 0) {
                    setMessage(
                        failed === 0
                            ? 'Done: the scores below are new.'
                            : failed === chosen.length
                              ? chosen.length === 1
                                  ? 'That didn’t run: the panel says why.'
                                  : 'None of them ran: their panels say why.'
                              : failed === 1
                                ? `1 of ${chosen.length} didn’t run: its panel says why.`
                                : `${failed} of ${chosen.length} didn’t run: their panels say why.`,
                    );
                }
                // The cached website data is out of date now: load it again for the new scores.
                invalidate('website');
                void revalidator.revalidate();
            });
        }
    };

    const pages = [...new Set(rows.map((row) => row.path))].map((path) => {
        const mine = rows.filter((row) => row.path === path);
        return {
            path,
            name: mine[0].page,
            devices: [...mine].sort(
                (a, b) => (a.strategy === 'mobile' ? 0 : 1) - (b.strategy === 'mobile' ? 0 : 1),
            ),
        };
    });

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:pl-4'>
                <p role='status' className='text-sm text-neutral-700'>
                    {message ||
                        (runnable.length === 0
                            ? 'Each page can be run again 10 minutes after its last run.'
                            : 'Scores are from the daily run. Run them now for fresh ones.')}
                </p>
                <button
                    type='button'
                    onClick={() => start(runnable)}
                    disabled={runnable.length === 0}
                    className={clsx(secondaryAction, 'shrink-0')}
                >
                    {running.length > 0 ? <Spinner /> : <RunIcon />}
                    {runnable.length === rows.length || runnable.length === 0
                        ? 'Run all now'
                        : `Run ${runnable.length} now`}
                </button>
            </div>
            {pages.map((page, index) => (
                <section key={page.path} aria-labelledby={`lighthouse-page-${index}`}>
                    <h3
                        id={`lighthouse-page-${index}`}
                        className='flex flex-wrap items-baseline gap-x-2 mb-3'
                    >
                        <span className='text-lg font-bold'>{page.name}</span>{' '}
                        <span className='text-sm font-normal text-neutral-600'>{page.path}</span>
                    </h3>
                    <div className='grid gap-3 md:grid-cols-2'>
                        {page.devices.map((row) => (
                            <DevicePanel
                                key={row.strategy}
                                row={row}
                                run={runs[row.key]}
                                coolingUntil={coolingUntil(row)}
                                onRun={() => start([row])}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};
