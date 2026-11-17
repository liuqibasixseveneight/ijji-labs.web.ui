import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

type CopyButtonProps = {
    /** What goes on the clipboard. */
    text: string;
    /** What it copies, for screen readers and the tooltip: "Copy email address". */
    label: string;
    /** Show the label beside the icon, not just as its name. @default false */
    showLabel?: boolean;
    tone?: 'light' | 'dark';
    className?: string;
};

const CopyIcon = () => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
    >
        <rect x='9' y='9' width='11' height='11' rx='2' />
        <path d='M5 15V6a2 2 0 0 1 2-2h9' />
    </svg>
);

const TickIcon = () => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
    >
        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
);

/**
 * Copies `text` to the clipboard, and says so for two seconds: a tick (and "Copied" in place
 * of the label, if it shows one), with "Copied" read out by screen readers.
 * The page is served over HTTPS (or localhost), so the clipboard is available.
 */
export const CopyButton = ({
    text,
    label,
    showLabel = false,
    tone = 'light',
    className,
}: CopyButtonProps) => {
    const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

    useEffect(() => {
        if (state === 'idle') return;
        const timer = setTimeout(() => setState('idle'), 2000);
        return () => clearTimeout(timer);
    }, [state]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setState('copied');
        } catch {
            setState('failed');
        }
    };

    const message = state === 'copied' ? 'Copied' : state === 'failed' ? 'Couldn’t copy' : '';

    return (
        <span className={clsx('inline-flex items-center gap-2', className)}>
            <button
                type='button'
                onClick={copy}
                title={label}
                aria-label={showLabel ? undefined : label}
                className={clsx(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-semibold cursor-pointer transition-colors',
                    tone === 'light'
                        ? 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800',
                    state === 'copied' && 'border-green-600 text-green-800',
                    state === 'failed' && 'border-red-600 text-red-700',
                )}
            >
                {state === 'copied' ? <TickIcon /> : <CopyIcon />}
                {showLabel && (state === 'idle' ? label : message)}
            </button>
            {/* Read out on its own; the tick (and, with a label, the text) shows it. */}
            <span role='status' className='sr-only'>
                {message}
            </span>
        </span>
    );
};
