import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { postForm } from '../../../../lib/postForm.ts';
import { site } from '../../../../content/site.ts';
import { Button, FieldWrapper, Honeypot, TextareaInput, TextInput } from '../../atoms';
import { FormError, FormSuccess } from '../../molecules';
import { deletionRequestSchema, type DeletionRequestData } from './schema.ts';
import type { DeletionRequestFormProps } from './types.ts';

/** Asks us to delete an app account, for someone who no longer has the app. */
export const DeletionRequestForm = ({ app }: DeletionRequestFormProps) => {
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<DeletionRequestData>({
        resolver: zodResolver(deletionRequestSchema),
        defaultValues: { app: app.slug },
    });

    const onSubmit = async (data: DeletionRequestData) => {
        setSubmitState('idle');
        const result = await postForm('account-deletion', data);
        if (result.success) {
            setSubmitState('success');
        } else {
            setSubmitState('error');
            setErrorMessage(result.error);
        }
    };

    if (submitState === 'success') {
        return (
            <FormSuccess
                title='Request received'
                message={`We'll email you from ${site.email} to confirm it's you, then delete your ${app.name} account ${site.deletionTime}.`}
            />
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label={`Ask us to delete your ${app.name} account`}
            className='relative flex flex-col gap-6 bg-neutral-100 p-6 sm:p-8 text-base'
        >
            <Honeypot {...register('website')} />
            <input type='hidden' {...register('app')} />

            <FieldWrapper
                label='Email address on your account'
                error={errors.email?.message}
                required
            >
                <TextInput
                    {...register('email')}
                    type='email'
                    placeholder='you@example.com'
                    autoComplete='email'
                />
            </FieldWrapper>

            <FieldWrapper
                label='Anything you’d like to tell us? (optional)'
                error={errors.reason?.message}
            >
                <TextareaInput
                    {...register('reason')}
                    rows={4}
                    placeholder='It helps us improve, but you don’t have to say.'
                />
            </FieldWrapper>

            <div className='flex flex-col gap-2'>
                <label className='flex items-start gap-3 text-neutral-800 cursor-pointer'>
                    <input
                        type='checkbox'
                        {...register('confirm')}
                        className='mt-1.5 w-4 h-4 accent-ui-background-primary shrink-0'
                    />
                    <span>
                        I understand my {app.name} account and everything in it will be deleted
                        permanently.
                    </span>
                </label>
                {errors.confirm && (
                    <p role='alert' className='text-xs text-red-500 font-medium'>
                        {errors.confirm.message}
                    </p>
                )}
            </div>

            {submitState === 'error' && (
                <FormError title='We couldn’t send your request' message={errorMessage} />
            )}

            <div className='flex justify-end pt-2'>
                <Button type='submit' isLoading={isSubmitting} label='Request deletion' />
            </div>
        </form>
    );
};
