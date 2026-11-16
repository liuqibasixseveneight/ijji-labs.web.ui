import type { FieldWrapperProps } from './types.ts';

/** Labels its field by wrapping it, so the field is named by `label` for screen readers and tests. */
export const FieldWrapper = ({ label, error, required, children }: FieldWrapperProps) => (
    <div className='flex flex-col gap-2'>
        <label className='flex flex-col gap-2'>
            <span className='text-xs font-bold tracking-widest uppercase text-neutral-500'>
                {label}
                {required && (
                    <span aria-hidden='true' className='text-red-400 ml-1'>
                        *
                    </span>
                )}
            </span>

            {children}
        </label>

        {error && (
            <p role='alert' className='text-xs text-red-500 font-medium'>
                {error}
            </p>
        )}
    </div>
);
