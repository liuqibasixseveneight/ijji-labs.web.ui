import { SORTS, type Sort } from '../../deletionRequests.ts';
import { eyebrow, secondaryAction } from '../styles.ts';

type ToolbarProps = {
    query: string;
    sort: Sort;
    shown: number;
    total: number;
    onQuery: (query: string) => void;
    onSort: (sort: Sort) => void;
};

const field =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500';

/**
 * Find requests fast once there are lots of them: search by email, reason, note or app, and
 * choose the order. Says how many are showing, with a way to clear the search.
 */
export const Toolbar = ({ query, sort, shown, total, onQuery, onSort }: ToolbarProps) => (
    <div className='flex flex-col gap-3 mb-6'>
        <div role='search' className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]'>
            <label className='flex flex-col gap-1.5'>
                <span className={eyebrow}>Search requests</span>
                <input
                    type='search'
                    value={query}
                    onChange={(event) => onQuery(event.target.value)}
                    placeholder='Email, reason, note or app'
                    autoComplete='off'
                    spellCheck={false}
                    className={field}
                />
            </label>
            <label className='flex flex-col gap-1.5'>
                <span className={eyebrow}>Sort open requests</span>
                <select
                    value={sort}
                    onChange={(event) => onSort(event.target.value as Sort)}
                    className={`${field} font-semibold cursor-pointer`}
                >
                    {Object.entries(SORTS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>
        </div>

        {/* Always there, so screen readers hear the count change as you type. */}
        <div className='flex flex-wrap items-center gap-3 text-sm text-neutral-700'>
            <p role='status'>
                {query.trim() && (
                    <>
                        Showing <strong>{shown}</strong> of {total}{' '}
                        {total === 1 ? 'request' : 'requests'}
                    </>
                )}
            </p>
            {query.trim() && (
                <button type='button' onClick={() => onQuery('')} className={secondaryAction}>
                    Clear search
                </button>
            )}
        </div>
    </div>
);
