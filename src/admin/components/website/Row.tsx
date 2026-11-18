import type { ReactNode } from 'react';

type RowProps = {
    /** The state, as a StatusBadge. */
    badge: ReactNode;
    title: ReactNode;
    /** Short facts, shown "a · b · c"; each stays on one line, so they wrap between facts. */
    meta?: (ReactNode | false | null | undefined)[];
    /** A chart or sparkline: on the right from md, underneath on phones. */
    aside?: ReactNode;
    children?: ReactNode;
};

/**
 * One line in a website card (an uptime check, a Lighthouse page, a deploy), laid out the same
 * everywhere: badge and title, the facts underneath, anything more below, and a small chart
 * to the side. On phones it all stacks, full width.
 */
export const Row = ({ badge, title, meta, aside, children }: RowProps) => {
    const facts = (meta ?? []).filter(
        (fact) => fact !== false && fact !== null && fact !== undefined,
    );
    return (
        <li className='py-4 first:pt-0 last:pb-0 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6'>
            <div className='min-w-0 flex flex-col gap-2'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    {badge}
                    <span className='font-semibold [overflow-wrap:anywhere]'>{title}</span>
                </div>
                {facts.length > 0 && (
                    <p className='text-sm text-neutral-600 leading-relaxed'>
                        {facts.map((fact, index) => (
                            <span key={index}>
                                {index > 0 && ' · '}
                                <span className='whitespace-nowrap'>{fact}</span>
                            </span>
                        ))}
                    </p>
                )}
                {children}
            </div>
            {aside && <div className='min-w-0 md:justify-self-end'>{aside}</div>}
        </li>
    );
};
