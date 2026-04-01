import type { FormRowProps } from './types.ts';

export const FormRow = ({ children }: FormRowProps) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{children}</div>
);
