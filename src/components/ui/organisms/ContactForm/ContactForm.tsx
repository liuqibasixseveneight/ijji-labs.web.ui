import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, FieldWrapper, TextInput, SelectInput, TextareaInput } from '../../atoms';
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
            <div className='flex flex-col gap-4 py-10 items-start'>
                <span className='text-brand-primary text-3xl'>✓</span>
                <h3 className='text-3xl font-extrabold text-ui-background-primary'>
                    Message sent.
                </h3>
                <p className='text-neutral-600 text-sm leading-relaxed max-w-sm'>
                    Thanks for reaching out — we'll be in touch shortly.
                </p>
                <button
                    onClick={() => setSubmitState('idle')}
                    className='mt-4 text-xs font-semibold tracking-widest uppercase text-neutral-400 hover:text-ui-background-primary transition-colors'
                >
                    Send another message
                </button>
            </div>
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

                {submitState === 'error' && <p className='text-sm text-red-500'>{errorMessage}</p>}

                <div className='w-full flex items-center justify-end pt-10'>
                    <Button type='submit' disabled={isSubmitting} label='Send message' />
                </div>
            </form>
        </FormProvider>
    );
};
