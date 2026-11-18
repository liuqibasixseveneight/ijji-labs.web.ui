import type { ReactNode } from 'react';
import { clsx } from 'clsx';

import { useCollapsed } from '../collapsed.ts';
import { CardBody, CardHeader } from './Card.tsx';
import { panel } from './styles.ts';

// Placeholders shaped like what's coming, shown while a page's data loads the first time, so
// the page appears at once and doesn't jump when the data lands. They pulse gently (still,
// with reduced motion: index.css cuts animations) and are hidden from screen readers, which
// hear one "Loading…" instead.

/** One grey shape. */
export const Bone = ({ className }: { className?: string }) => (
    <span
        aria-hidden='true'
        className={clsx('block rounded-md bg-neutral-200 animate-pulse', className)}
    />
);

/**
 * A card as it will look, its real title and hint over placeholder contents. It can be
 * collapsed like the card, and stays collapsed if the card was.
 */
export const SkeletonCard = ({
    id,
    title,
    hint,
    children,
}: {
    id: string;
    title: string;
    hint: string;
    children: ReactNode;
}) => {
    const [collapsed, setCollapsed] = useCollapsed(id);
    return (
        <div className={panel}>
            <CardHeader
                id={id}
                title={title}
                hint={hint}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />
            <CardBody id={id} collapsed={collapsed}>
                <div aria-hidden='true'>{children}</div>
            </CardBody>
        </div>
    );
};

/** Rows of a list: a badge, a line of text and a shorter one. */
export const SkeletonRows = ({ count = 3, aside = false }: { count?: number; aside?: boolean }) => (
    <div className='divide-y divide-neutral-200'>
        {Array.from({ length: count }, (_, i) => (
            <div
                key={i}
                className='py-4 first:pt-0 last:pb-0 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6'
            >
                <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                        <Bone className='h-5 w-14 rounded-full' />
                        <Bone className='h-5 w-40 max-w-[60%]' />
                    </div>
                    <Bone className='h-4 w-64 max-w-[85%]' />
                </div>
                {aside && <Bone className='h-6 w-full md:w-72' />}
            </div>
        ))}
    </div>
);

/** Number tiles. */
export const SkeletonTiles = ({ count = 4 }: { count?: number }) => (
    <div
        className={clsx(
            'grid grid-cols-2 gap-2',
            count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4',
        )}
    >
        {Array.from({ length: count }, (_, i) => (
            <div
                key={i}
                className='rounded-xl bg-neutral-50 border border-neutral-200 p-3 flex flex-col gap-2'
            >
                <Bone className='h-3 w-16' />
                <Bone className='h-7 w-12' />
                <Bone className='h-3 w-20' />
            </div>
        ))}
    </div>
);

/** A bar chart's area, with its baseline. */
export const SkeletonBars = () => (
    <div className='flex flex-col gap-2'>
        <div className='h-20 border-b border-[#c3c2b7] flex items-end gap-1'>
            <Bone className='h-1/2 flex-1 rounded-b-none' />
        </div>
        <div className='flex justify-between'>
            <Bone className='h-3 w-12' />
            <Bone className='h-3 w-10' />
        </div>
    </div>
);

/** Says "Loading…" once, for screen readers, while a page's skeleton shows. */
export const LoadingStatus = ({ children }: { children: string }) => (
    <p role='status' className='sr-only'>
        {children}
    </p>
);
