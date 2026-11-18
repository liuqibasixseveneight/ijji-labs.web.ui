import { useEffect, useState, type ReactNode } from 'react';
import { useRevalidator } from 'react-router-dom';
import { clsx } from 'clsx';

import { invalidate, type Loaded } from '../cache.ts';
import { useAllCollapsed } from '../collapsed.ts';
import { secondaryAction } from './styles.ts';

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * A toolbar button: a square icon on phones (named by its hidden label, with a tooltip), the
 * icon and label from sm. Never `disabled` while busy, which would drop keyboard focus.
 */
const ToolButton = ({
    label,
    icon,
    busy = false,
    onClick,
}: {
    label: string;
    icon: ReactNode;
    busy?: boolean;
    onClick: () => void;
}) => (
    <button
        type='button'
        title={label}
        aria-disabled={busy || undefined}
        onClick={() => {
            if (!busy) onClick();
        }}
        className={clsx(
            secondaryAction,
            'h-9 w-9 p-0 sm:w-auto sm:px-3 aria-disabled:opacity-50 aria-disabled:cursor-wait',
        )}
    >
        {icon}
        <span className='sr-only sm:not-sr-only'>{label}</span>
    </button>
);

const Icon = ({ children, spin = false }: { children: ReactNode; spin?: boolean }) => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        className={clsx('w-4 h-4 shrink-0', spin && 'animate-spin')}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        {children}
    </svg>
);

/** When the page's data arrived, and whether newer data is on its way. */
const useUpdated = <T,>(loaded: Loaded<T>) => {
    const revalidator = useRevalidator();
    const { data } = loaded;
    const pending = data instanceof Promise;
    const [arrived, setArrived] = useState<{ for: unknown; at: number } | null>(null);

    useEffect(() => {
        if (!(data instanceof Promise)) return;
        let live = true;
        void data.then(() => {
            if (live) setArrived({ for: data, at: Date.now() });
        });
        return () => {
            live = false;
        };
    }, [data]);

    const done = !pending || arrived?.for === data;
    return {
        busy: !done || revalidator.state === 'loading',
        at: pending ? (done ? arrived!.at : loaded.at) : loaded.at,
        refresh: () => void revalidator.revalidate(),
    };
};

/**
 * A section page's heading and controls: its title and what it covers, an optional switcher
 * (the Supabase project), and a toolbar saying when the data is from, with Refresh and
 * Collapse all. On phones the switcher spans the width and the toolbar is one bar beneath;
 * from sm they sit to the right of the title. The toolbar stays outside what reloads, so
 * Refresh keeps focus.
 */
export const PageHeader = <T,>({
    id,
    title,
    lede,
    loaded,
    cacheKey,
    cardIds,
    switcher,
}: {
    id: string;
    title: string;
    lede: string;
    loaded: Loaded<T>;
    /** The cache entries this page's data lives under, for Refresh. */
    cacheKey: string;
    /** The page's cards, for Collapse all. */
    cardIds: readonly string[];
    switcher?: ReactNode;
}) => {
    const { busy, at, refresh } = useUpdated(loaded);
    const [allCollapsed, setAllCollapsed] = useAllCollapsed(cardIds);

    return (
        <div className='flex flex-col gap-4 mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6'>
            <div className='min-w-0'>
                <h1 id={id} className='text-3xl sm:text-4xl font-extrabold mb-2'>
                    {title}
                </h1>
                <p className='text-neutral-600'>{lede}</p>
            </div>

            <div className='flex flex-col gap-3 sm:items-end sm:shrink-0'>
                {switcher}
                <div className='flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 py-1.5 pl-3.5 pr-1.5 sm:border-0 sm:bg-transparent sm:p-0'>
                    <p
                        role='status'
                        className='text-sm text-neutral-600 tabular-nums whitespace-nowrap'
                    >
                        {busy ? 'Updating…' : at !== null ? `Updated ${time.format(at)}` : ''}
                    </p>
                    <div className='flex items-center gap-1.5 sm:gap-2'>
                        <ToolButton
                            label='Refresh'
                            busy={busy}
                            onClick={() => {
                                invalidate(cacheKey);
                                refresh();
                            }}
                            icon={
                                <Icon spin={busy}>
                                    <path d='M21 12a9 9 0 1 1-2.64-6.36' />
                                    <path d='M21 4v5h-5' />
                                </Icon>
                            }
                        />
                        <ToolButton
                            label={allCollapsed ? 'Expand all' : 'Collapse all'}
                            onClick={() => setAllCollapsed(!allCollapsed)}
                            icon={
                                <Icon>
                                    {allCollapsed ? (
                                        <path d='m7 15 5 5 5-5M7 9l5-5 5 5' />
                                    ) : (
                                        <path d='m7 20 5-5 5 5M7 4l5 5 5-5' />
                                    )}
                                </Icon>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
