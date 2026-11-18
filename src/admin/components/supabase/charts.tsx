import { clsx } from 'clsx';

// Charts for the Supabase page, after the dataviz guide (as on the Website page): one blue
// for a single series, thin bars with rounded tops, a hover title on every bar, and a
// table behind every chart for screen readers.

const SERIES = '#2a78d6';
const STATUS = { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b' } as const;

export type Point = { key: string; label: string; value: number };

/**
 * A series as bars along a baseline, with its first and last labels beneath. `describe`
 * words a point for its hover title and the table ("3 sign-ups").
 */
export const Bars = ({
    caption,
    points,
    describe,
    columnLabel,
    valueLabel,
    endLabel,
    className,
}: {
    caption: string;
    points: Point[];
    describe: (value: number) => string;
    columnLabel: string;
    valueLabel: string;
    /** Under the last bar: "Today", "Now". */
    endLabel: string;
    className?: string;
}) => {
    const max = Math.max(1, ...points.map((p) => p.value));
    return (
        <figure className={clsx('flex flex-col gap-2 min-w-0', className)}>
            <div
                aria-hidden='true'
                className='flex items-end gap-px sm:gap-[2px] h-20 border-b border-[#c3c2b7]'
            >
                {points.map((point) => (
                    <span
                        key={point.key}
                        title={`${point.label}: ${describe(point.value)}`}
                        className='flex-1 min-w-0 rounded-t-sm'
                        style={{
                            height: point.value
                                ? `${Math.max(6, (point.value / max) * 100)}%`
                                : '0',
                            background: SERIES,
                        }}
                    />
                ))}
            </div>
            <figcaption className='flex justify-between gap-3 text-xs text-neutral-600'>
                <span>{points[0]?.label}</span>
                <span>{endLabel}</span>
            </figcaption>
            {/* In a hidden wrapper: a table ignores sr-only's 1px size and lengthens the page. */}
            <div className='sr-only'>
                <table>
                    <caption>{caption}</caption>
                    <thead>
                        <tr>
                            <th scope='col'>{columnLabel}</th>
                            <th scope='col'>{valueLabel}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.map((point) => (
                            <tr key={point.key}>
                                <th scope='row'>{point.label}</th>
                                <td>{point.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    );
};

/**
 * How full something is, as a bar: blue while there's room, amber from 70%, red from 90%,
 * with the share in words beside it (never colour alone).
 */
export const Meter = ({ label, used, limit }: { label: string; used: number; limit: number }) => {
    const share = Math.min(1, used / limit);
    const percent = Math.round(share * 100);
    const colour = share >= 0.9 ? STATUS.critical : share >= 0.7 ? STATUS.warning : SERIES;
    return (
        <div
            role='meter'
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent < 1 && used > 0 ? 'under 1' : percent}% used`}
            className='h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden'
        >
            <div
                className='h-full rounded-full'
                style={{ width: `${Math.max(used > 0 ? 1 : 0, percent)}%`, background: colour }}
            />
        </div>
    );
};
