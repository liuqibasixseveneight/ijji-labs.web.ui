import type { SelectHTMLAttributes } from 'react';

const selectClass =
    'w-full bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 px-4 py-3 rounded-xl outline-none transition-colors focus:border-neutral-600 appearance-none cursor-pointer';

export const SelectInput = ({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className='relative'>
        <select className={selectClass} {...props}>
            {children}
        </select>
        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs'>
            ▾
        </span>
    </div>
);
