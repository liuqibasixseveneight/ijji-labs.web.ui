import { clsx } from 'clsx';

import { useAllCollapsed } from '../collapsed.ts';
import { secondaryAction } from './styles.ts';

/** Collapses every card on a page, or opens them all again once they all are. */
export const CollapseAll = ({ ids }: { ids: readonly string[] }) => {
    const [all, setAll] = useAllCollapsed(ids);
    return (
        <button
            type='button'
            onClick={() => setAll(!all)}
            className={clsx(secondaryAction, 'px-2.5 py-1.5')}
        >
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
                {all ? (
                    <path d='m7 15 5 5 5-5M7 9l5-5 5 5' />
                ) : (
                    <path d='m7 20 5-5 5 5M7 4l5 5 5-5' />
                )}
            </svg>
            {all ? 'Expand all' : 'Collapse all'}
        </button>
    );
};
