import { ArtisticFrame, Button } from '../../atoms';
import type { FormErrorProps, FormSuccessProps } from './types.ts';

/** Shown in place of a form once it has been sent. */
export const FormSuccess = ({ title, message, actionLabel, onAction }: FormSuccessProps) => (
    <ArtisticFrame className='flex flex-col gap-6 py-16 items-center text-center bg-white/50 p-8 shadow-sm backdrop-blur-sm'>
        <div
            aria-hidden='true'
            className='w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2'
        >
            <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2.5'
                    d='M5 13l4 4L19 7'
                />
            </svg>
        </div>
        <div role='status' className='space-y-2'>
            <h3 className='text-3xl font-extrabold text-ui-background-primary mb-6'>{title}</h3>
            <p className='text-neutral-500 text-base leading-relaxed max-w-120 mx-auto'>
                {message}
            </p>
        </div>
        {actionLabel && onAction && (
            <Button onClick={onAction} label={actionLabel} className='mt-6' />
        )}
    </ArtisticFrame>
);

/** Shown under a form when sending failed; what was typed stays in the form. */
export const FormError = ({ title, message }: FormErrorProps) => (
    <div
        role='alert'
        className='flex items-start gap-3 p-4 mt-2 bg-red-50 text-red-800 rounded-lg border border-red-200'
    >
        <svg
            aria-hidden='true'
            className='w-5 h-5 mt-0.5 shrink-0 text-red-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
        </svg>
        <div className='flex flex-col'>
            <span className='font-semibold text-sm'>{title}</span>
            <span className='text-sm mt-1'>{message}</span>
        </div>
    </div>
);
