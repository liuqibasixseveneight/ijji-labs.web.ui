import type { InputHTMLAttributes } from 'react';

const inputClass =
    'w-full bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 px-4 py-3 rounded-xl outline-none transition-colors focus:border-neutral-600';

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input className={inputClass} {...props} />
);
