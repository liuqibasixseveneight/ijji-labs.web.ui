import type { SelectHTMLAttributes } from 'react';

const selectClass =
    'field-native w-full bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-400 px-4 py-3 rounded-xl outline-none transition-colors focus:border-neutral-600 appearance-none cursor-pointer';

export const SelectInput = ({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className='relative'>
        <select className={selectClass} {...props}>
            {children}
        </select>
        <span
            aria-hidden='true'
            className='absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none'
        >
            ▾
        </span>
    </div>
);
