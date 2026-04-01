import type { FieldWrapperProps } from './types.ts';

export const FieldWrapper = ({ label, error, required, children }: FieldWrapperProps) => (
    <div className='flex flex-col gap-2'>
        <label className='text-xs font-bold tracking-widest uppercase text-neutral-500'>
            {label}
            {required && <span className='text-red-400 ml-1'>*</span>}
        </label>

        {children}

        {error && <p className='text-xs text-red-500 font-medium'>{error}</p>}
    </div>
);
