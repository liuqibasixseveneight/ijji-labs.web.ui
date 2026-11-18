import { clsx } from 'clsx';

import {
    FORM_LABELS,
    OUTCOME_LABELS,
    OUTCOMES,
    sum,
    type CheckSummary,
    type Counts,
} from '../../website.ts';

// Small charts for the website page, after the dataviz guide: status colours only for
// up/down and the Lighthouse bands (always with an icon and a word), one blue for a single
// series, thin marks with rounded ends, a hover title on every mark, and a table behind
// every chart for screen readers.

/** The guide's status steps, for marks (text stays in ink colours). */
const STATUS = { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b' } as const;
/** The guide's blue (step 450), for a single series. */
const SERIES = '#2a78d6';

const LEVEL_STYLES = {
    good: 'bg-green-100 text-green-900',
    warning: 'bg-amber-100 text-amber-900',
    critical: 'bg-red-100 text-red-800',
    neutral: 'bg-neutral-100 text-neutral-800',
} as const;
const LEVEL_ICONS = { good: '✓', warning: '!', critical: '✕', neutral: '•' } as const;

/** A state as a word with an icon on a tinted pill: never colour alone. */
export const StatusBadge = ({
    level,
    label,
    className,
}: {
    level: keyof typeof LEVEL_STYLES;
    label: string;
    className?: string;
}) => (
    <span
        className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap',
            LEVEL_STYLES[level],
            className,
        )}
    >
        <span aria-hidden='true'>{LEVEL_ICONS[level]}</span>
        {label}
    </span>
);

const timeFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

/** A check's recent runs as a strip of thin bars: green passed, red failed (taller). */
export const UptimeStrip = ({ recent }: { recent: CheckSummary['recent'] }) => {
    const passed = recent.filter((run) => run.ok).length;
    return (
        <div
            role='img'
            aria-label={`Last ${recent.length} checks: ${passed} passed, ${recent.length - passed} failed`}
            className='flex items-end gap-[2px] h-6'
        >
            {recent.map((run) => (
                <span
                    key={run.at}
                    title={`${timeFormat.format(run.at)} · ${run.ok ? `up, ${run.ms} ms` : 'failed'}`}
                    className={clsx('w-1 rounded-t-sm', run.ok ? 'h-4' : 'h-6')}
                    style={{ background: run.ok ? STATUS.good : STATUS.critical }}
                />
            ))}
        </div>
    );
};

/** One score's recent history as a thin line, for the trend beside the latest number. */
export const Sparkline = ({ values, label }: { values: number[]; label: string }) => {
    if (values.length < 2) return null;
    const width = 96;
    const height = 28;
    const points = values
        .map((value, i) => {
            const x = (i / (values.length - 1)) * (width - 4) + 2;
            const y = height - 2 - (value / 100) * (height - 4);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return (
        <svg
            role='img'
            aria-label={`${label}: ${values.join(', ')}`}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className='shrink-0'
        >
            <title>{`${label}: ${values.join(', ')}`}</title>
            <line x1='2' x2={width - 2} y1={height - 2} y2={height - 2} stroke='#e1e0d9' />
            <polyline
                points={points}
                fill='none'
                stroke={SERIES}
                strokeWidth='2'
                strokeLinejoin='round'
                strokeLinecap='round'
            />
        </svg>
    );
};

const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/**
 * A form's posts per day as thin bars (one series, so no legend), with each day's breakdown
 * on hover and in the table behind it.
 */
export const FormBars = ({
    form,
    days,
    byDay,
}: {
    form: keyof typeof FORM_LABELS;
    days: string[];
    byDay: Counts[];
}) => {
    const totals = byDay.map(sum);
    const max = Math.max(1, ...totals);
    const describe = (i: number) =>
        `${dayFormat.format(new Date(days[i]))}: ${totals[i]} ${totals[i] === 1 ? 'post' : 'posts'}${
            totals[i]
                ? ` (${OUTCOMES.filter((o) => byDay[i][o])
                      .map((o) => `${byDay[i][o]} ${OUTCOME_LABELS[o].toLowerCase()}`)
                      .join(', ')})`
                : ''
        }`;

    return (
        <figure className='flex flex-col gap-2'>
            <div
                aria-hidden='true'
                className='flex items-end gap-[2px] h-20 border-b border-[#c3c2b7]'
            >
                {totals.map((total, i) => (
                    <span
                        key={days[i]}
                        title={describe(i)}
                        className='flex-1 rounded-t'
                        style={{
                            height: total ? `${Math.max(8, (total / max) * 100)}%` : '0',
                            background: SERIES,
                        }}
                    />
                ))}
            </div>
            <figcaption className='flex justify-between text-xs text-neutral-600'>
                <span>{dayFormat.format(new Date(days[0]))}</span>
                <span>Today</span>
            </figcaption>
            {/* In a hidden wrapper: a table ignores sr-only's 1px size and lengthens the page. */}
            <div className='sr-only'>
                <table>
                    <caption>{FORM_LABELS[form]} form posts per day</caption>
                    <thead>
                        <tr>
                            <th scope='col'>Day</th>
                            {OUTCOMES.map((o) => (
                                <th key={o} scope='col'>
                                    {OUTCOME_LABELS[o]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day, i) => (
                            <tr key={day}>
                                <th scope='row'>{dayFormat.format(new Date(day))}</th>
                                {OUTCOMES.map((o) => (
                                    <td key={o}>{byDay[i][o]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    );
};
