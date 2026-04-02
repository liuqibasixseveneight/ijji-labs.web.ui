import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Button,
    FieldWrapper,
    TextInput,
    SelectInput,
    TextareaInput,
    ArtisticFrame,
} from '../../atoms';
import { FormRow } from '../../molecules';
import { contactSchema } from './schema';
import { submitForm } from './submitForm';
import { PROJECT_TYPES, CONTACT_METHODS } from './constants';
import type { ContactFormData } from './types';

export const ContactForm = () => {
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const methods = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = methods;

    const onSubmit = async (data: ContactFormData) => {
        setSubmitState('idle');
        const result = await submitForm(data);
        if (result.success) {
            setSubmitState('success');
            reset();
        } else {
            setSubmitState('error');
            setErrorMessage(result.error);
        }
    };

    if (submitState === 'success') {
        return (
            <ArtisticFrame className='flex flex-col gap-6 py-16 items-center text-center bg-white/50 p-8 shadow-sm backdrop-blur-sm'>
                <div className='w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2'>
                    <svg
                        className='w-10 h-10'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2.5'
                            d='M5 13l4 4L19 7'
                        />
                    </svg>
                </div>
                <div className='space-y-2'>
                    <h3 className='text-3xl font-extrabold text-ui-background-primary mb-6'>
                        Message sent!
                    </h3>
                    <p className='text-neutral-500 text-base leading-relaxed max-w-120 mx-auto'>
                        Thanks for reaching out. We've received your message and will be in touch
                        within two working days.
                    </p>
                </div>
                <Button
                    onClick={() => setSubmitState('idle')}
                    label='Send another message'
                    className='mt-6'
                />
            </ArtisticFrame>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-6'>
                <FormRow>
                    <FieldWrapper label='Your name' error={errors.name?.message} required>
                        <TextInput
                            {...register('name')}
                            type='text'
                            placeholder='Jane Smith'
                            autoComplete='name'
                        />
                    </FieldWrapper>
                    <FieldWrapper label='Company name' error={errors.company?.message}>
                        <TextInput
                            {...register('company')}
                            type='text'
                            placeholder='Your Company Ltd'
                            autoComplete='organization'
                        />
                    </FieldWrapper>
                </FormRow>

                <FormRow>
                    <FieldWrapper label='Email address' error={errors.email?.message} required>
                        <TextInput
                            {...register('email')}
                            type='email'
                            placeholder='jane@your.company'
                            autoComplete='email'
                        />
                    </FieldWrapper>
                    <FieldWrapper label='Contact number' error={errors.phone?.message} required>
                        <TextInput
                            {...register('phone')}
                            type='tel'
                            placeholder='+44'
                            autoComplete='tel'
                        />
                    </FieldWrapper>
                </FormRow>

                <FormRow>
                    <FieldWrapper label='Project type' error={errors.projectType?.message} required>
                        <SelectInput {...register('projectType')} defaultValue=''>
                            <option value='' disabled>
                                Select a project type
                            </option>
                            {PROJECT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </SelectInput>
                    </FieldWrapper>
                    <FieldWrapper
                        label='Preferred contact method'
                        error={errors.preferredContact?.message}
                    >
                        <SelectInput {...register('preferredContact')} defaultValue=''>
                            <option value=''>No preference</option>
                            {CONTACT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </SelectInput>
                    </FieldWrapper>
                </FormRow>

                <FieldWrapper label='Message' error={errors.message?.message} required>
                    <TextareaInput
                        {...register('message')}
                        rows={10}
                        placeholder='Tell us about your project...'
                    />
                </FieldWrapper>

                <FieldWrapper label='How did you hear about us?' error={errors.referral?.message}>
                    <TextInput
                        {...register('referral')}
                        type='text'
                        placeholder='Google, a referral, social media...'
                    />
                </FieldWrapper>

                {submitState === 'error' && (
                    <div className='flex items-start gap-3 p-4 mt-2 bg-red-50 text-red-800 rounded-lg border border-red-200'>
                        <svg
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
                            <span className='font-semibold text-sm'>Failed to send message</span>
                            <span className='text-sm mt-1'>{errorMessage}</span>
                        </div>
                    </div>
                )}

                <div className='w-full flex items-center justify-end pt-6'>
                    <Button type='submit' isLoading={isSubmitting} label='Send message' />
                </div>
            </form>
        </FormProvider>
    );
};
