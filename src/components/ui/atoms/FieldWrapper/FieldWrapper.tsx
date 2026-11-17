import { cloneElement, isValidElement, useId, type ReactElement } from 'react';

import type { FieldWrapperProps } from './types.ts';

type FieldAria = {
    'aria-required'?: boolean;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

/**
 * Labels its field by wrapping it, so the field is named by `label` for screen readers and
 * tests. It also tells assistive tech what the eye sees: the field is marked required (the
 * asterisk itself is hidden from screen readers), and when there's an error the field is
 * marked invalid and points at the message, so it's read with the field.
 */
export const FieldWrapper = ({ label, error, required, children }: FieldWrapperProps) => {
    const errorId = useId();

    const field = isValidElement(children)
        ? cloneElement(children as ReactElement<FieldAria>, {
              'aria-required': required || undefined,
              'aria-invalid': error ? true : undefined,
              'aria-describedby': error ? errorId : undefined,
          })
        : children;

    return (
        <div className='flex flex-col gap-2'>
            <label className='flex flex-col gap-2'>
                <span className='text-xs font-bold tracking-widest uppercase text-neutral-600'>
                    {label}
                    {required && (
                        <span aria-hidden='true' className='text-red-700 ml-1'>
                            *
                        </span>
                    )}
                </span>

                {field}
            </label>

            {error && (
                <p id={errorId} role='alert' className='text-xs text-red-700 font-medium'>
                    {error}
                </p>
            )}
        </div>
    );
};
