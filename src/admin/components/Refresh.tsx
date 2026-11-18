import { useEffect, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { clsx } from 'clsx';

import { invalidate, type Loaded } from '../cache.ts';
import { secondaryAction } from './styles.ts';

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * When a page's data is from, and a button to load it again now. Says "Updating…" while
 * newer data loads. It sits in the page's header, outside what reloads, so it keeps focus.
 */
export const Refresh = <T,>({ loaded, cacheKey }: { loaded: Loaded<T>; cacheKey: string }) => {
    const revalidator = useRevalidator();
    const { data } = loaded;
    const pending = data instanceof Promise;
    // When the data still loading (if any) arrived.
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
    const busy = !done || revalidator.state === 'loading';
    const at = pending ? (done ? arrived!.at : loaded.at) : loaded.at;

    return (
        <div className='flex items-center gap-3 text-sm text-neutral-600'>
            <p role='status' className='tabular-nums whitespace-nowrap'>
                {busy ? 'Updating…' : at !== null ? `Updated ${time.format(at)}` : ''}
            </p>
            <button
                type='button'
                // Not `disabled` while busy: a disabled button drops keyboard focus.
                aria-disabled={busy || undefined}
                onClick={() => {
                    if (busy) return;
                    invalidate(cacheKey);
                    void revalidator.revalidate();
                }}
                className={clsx(
                    secondaryAction,
                    'px-2.5 py-1.5 aria-disabled:opacity-50 aria-disabled:cursor-wait',
                )}
            >
                <svg
                    aria-hidden='true'
                    viewBox='0 0 24 24'
                    className={clsx('w-4 h-4', busy && 'animate-spin')}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M21 12a9 9 0 1 1-2.64-6.36' />
                    <path d='M21 4v5h-5' />
                </svg>
                Refresh
            </button>
        </div>
    );
};
