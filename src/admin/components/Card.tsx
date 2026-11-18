import type { ReactNode } from 'react';

import type { Part } from '../website.ts';
import { panel } from './styles.ts';
import { StatusBadge } from './website/charts.tsx';

/**
 * A card on a section's page: its title, a line on what it shows, and either its contents or
 * why its data couldn't be had. The Website and Supabase pages are built from these, so every
 * card looks alike.
 */
export const Card = <T,>({
    id,
    title,
    hint,
    part,
    empty,
    action,
    children,
}: {
    id: string;
    title: string;
    hint: string;
    part: Part<T>;
    empty?: (data: T) => string | null;
    /** A link or button beside the title, such as "Open in Supabase". */
    action?: ReactNode;
    children: (data: T) => ReactNode;
}) => {
    const emptyMessage = part.data !== null && empty ? empty(part.data) : null;
    return (
        <section aria-labelledby={id} className={panel}>
            <header className='mb-5 pb-4 border-b border-neutral-200 flex flex-wrap items-start justify-between gap-x-4 gap-y-3'>
                <div className='min-w-0 flex-1 basis-60'>
                    <h2 id={id} className='text-xl font-bold'>
                        {title}
                    </h2>
                    <p className='text-sm text-neutral-600 mt-1'>{hint}</p>
                </div>
                {action}
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
