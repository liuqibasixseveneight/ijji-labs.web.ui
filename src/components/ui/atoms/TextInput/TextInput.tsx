import type { InputHTMLAttributes } from 'react';

const inputClass =
    'field-native w-full bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-400 px-4 py-3 rounded-xl outline-none transition-colors focus:border-neutral-600';

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input className={inputClass} {...props} />
);
