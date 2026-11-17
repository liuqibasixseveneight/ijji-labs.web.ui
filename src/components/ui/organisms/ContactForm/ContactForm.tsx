import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';

import { site } from '../../../../content/site.ts';
import { Button, FieldWrapper, Honeypot, SelectInput, TextareaInput, TextInput } from '../../atoms';
import { FormError, FormRow, FormSuccess } from '../../molecules';
import { CONTACT_METHODS, PROJECT_TYPES, SUPPORT_TYPES, TOPICS } from './constants.ts';
import { contactSchema } from './schema.ts';
import { submitForm } from './submitForm.ts';
import type { ContactFormData } from './types.ts';

/** The enquiry form, on Home and Contact. `/contact?topic=support` chooses its topic. */
export const ContactForm = () => {
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams] = useSearchParams();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

    // After the first render, so pre-rendered pages (built without the query) hydrate cleanly.
    const topic = TOPICS[searchParams.get('topic') ?? ''];
    useEffect(() => {
        if (topic) setValue('projectType', topic);
    }, [topic, setValue]);

    const isSupport = SUPPORT_TYPES.includes(useWatch({ control, name: 'projectType' }));

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
            <FormSuccess
                title='Message sent!'
                message={`Thanks for reaching out. We've received your message and will be in touch ${site.replyTime}.`}
                actionLabel='Send another message'
                onAction={() => setSubmitState('idle')}
            />
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='relative flex flex-col gap-6'>
            <Honeypot {...register('website')} />

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
                <FieldWrapper
                    label='Contact number'
                    error={errors.phone?.message}
                    required={!isSupport}
                >
                    <TextInput
                        {...register('phone')}
                        type='tel'
                        placeholder='+44'
                        autoComplete='tel'
                    />
                </FieldWrapper>
            </FormRow>

            <FormRow>
                <FieldWrapper label='What’s it about?' error={errors.projectType?.message} required>
                    <SelectInput {...register('projectType')} defaultValue=''>
                        <option value='' disabled>
                            Choose a topic
                        </option>
                        {PROJECT_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
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
                        {CONTACT_METHODS.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </SelectInput>
                </FieldWrapper>
            </FormRow>

            <FieldWrapper label='Message' error={errors.message?.message} required>
                <TextareaInput
                    {...register('message')}
                    rows={10}
                    placeholder={
                        isSupport
                            ? 'What happened, and what were you trying to do?'
                            : 'Tell us about your project...'
                    }
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
                <FormError title='Failed to send message' message={errorMessage} />
            )}

            <div className='w-full flex items-center justify-end pt-6'>
                <Button type='submit' isLoading={isSubmitting} label='Send message' />
            </div>
        </form>
    );
};
