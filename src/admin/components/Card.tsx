import type { ReactNode } from 'react';
import { clsx } from 'clsx';

import { useCollapsed } from '../collapsed.ts';
import type { Part } from '../website.ts';
import { panel } from './styles.ts';
import { StatusBadge } from './website/charts.tsx';

/** The arrow beside a card's title: down when open, right when collapsed. */
const Chevron = ({ collapsed }: { collapsed: boolean }) => (
    <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        className={clsx(
            'w-5 h-5 shrink-0 text-neutral-500 transition-transform duration-200',
            collapsed && '-rotate-90',
        )}
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='m6 9 6 6 6-6' />
    </svg>
);

/**
 * A card's header: its title as the button that collapses it, what it shows (and, while
 * collapsed, a short summary such as "2 warnings"), and an action beside it.
 */
export const CardHeader = ({
    id,
    title,
    hint,
    summary,
    action,
    collapsed,
    onToggle,
}: {
    id: string;
    title: string;
    hint: string;
    summary?: string | null;
    action?: ReactNode;
    collapsed: boolean;
    onToggle: () => void;
}) => (
    <header
        className={clsx(
            'flex flex-wrap items-start justify-between gap-x-4 gap-y-3 transition-[margin,padding] duration-200',
            !collapsed && 'mb-5 pb-4 border-b border-neutral-200',
        )}
    >
        <div className='min-w-0 flex-1 basis-60'>
            <h2 className='text-xl font-bold'>
                <button
                    type='button'
                    id={id}
                    aria-expanded={!collapsed}
                    aria-controls={`${id}-body`}
                    onClick={onToggle}
                    className='flex items-center gap-1.5 -ml-1 pl-1 pr-2 rounded-md text-left cursor-pointer hover:text-neutral-700'
                >
                    <Chevron collapsed={collapsed} />
                    {title}
                </button>
            </h2>
            <p className='text-sm text-neutral-600 mt-1 pl-6'>
                {hint}
                {collapsed && summary && (
                    <span className='block mt-1 font-semibold text-neutral-800'>{summary}</span>
                )}
            </p>
        </div>
        {action}
    </header>
);

/**
 * A card's body, folding away when collapsed: animated (cut with reduced motion), and inert
 * while closed so nothing hidden can be tabbed to or read out.
 */
export const CardBody = ({
    id,
    collapsed,
    children,
}: {
    id: string;
    collapsed: boolean;
    children: ReactNode;
}) => (
    <div
        id={`${id}-body`}
        inert={collapsed}
        className={clsx(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            // Closed, it clips to nothing; open, it doesn't clip (the inner box does, with room).
            collapsed ? 'grid-rows-[0fr] overflow-hidden' : 'grid-rows-[1fr]',
        )}
    >
        {/* Clipped with a little room around, so focus rings at the edges aren't cut. */}
        <div className='min-h-0 overflow-hidden -m-2 p-2'>{children}</div>
    </div>
);

/**
 * A card on a section's page: its title, a line on what it shows, and either its contents or
 * why its data couldn't be had. Every card can be collapsed from its title, and stays as it
 * was left. The Website and Supabase pages are built from these, so every card looks alike.
 */
export const Card = <T,>({
    id,
    title,
    hint,
    part,
    empty,
    summary,
    action,
    children,
}: {
    id: string;
    title: string;
    hint: string;
    part: Part<T>;
    empty?: (data: T) => string | null;
    /** A few words to show while collapsed: "All up", "2 warnings". */
    summary?: (data: T) => string | null;
    /** A link or button beside the title, such as "Open in Supabase". */
    action?: ReactNode;
    children: (data: T) => ReactNode;
}) => {
    const [collapsed, setCollapsed] = useCollapsed(id);
    const emptyMessage = part.data !== null && empty ? empty(part.data) : null;
    const brief =
        part.data === null
            ? 'Not available'
            : emptyMessage
              ? null
              : summary
                ? summary(part.data)
                : null;

    return (
        <section aria-labelledby={id} className={panel}>
            <CardHeader
                id={id}
                title={title}
                hint={hint}
                summary={brief}
                action={action}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />
            <CardBody id={id} collapsed={collapsed}>
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
            </CardBody>
        </section>
    );
};
