import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState } from 'react';
import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
    'Marketing website',
    'E-commerce',
    'Web application',
    'Rebrand & website',
    'Landing page',
    'Other',
] as const;

const CONTACT_METHODS = ['Email', 'Phone', 'SMS', 'No preference'] as const;

const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters'),
    company: z
        .string()
        .max(100, 'Company name must be under 100 characters')
        .optional()
        .or(z.literal('')),
    email: z.email('Please enter a valid email address').min(1, 'Email is required'),
    phone: z
        .string()
        .min(1, 'Contact number is required')
        .regex(/^\+?[0-9\s\-().]{7,20}$/, {
            message: 'Please enter a valid phone number',
        }),
    projectType: z.enum([...PROJECT_TYPES], {
        error: 'Please select a project type',
    }),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be under 2000 characters'),
    preferredContact: z.enum([...CONTACT_METHODS]).optional(),
    referral: z
        .string()
        .max(200, 'Please keep this under 200 characters')
        .optional()
        .or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Submission ───────────────────────────────────────────────────────────────

type SubmitResult = { success: true } | { success: false; error: string };

async function submitContactForm(data: ContactFormData): Promise<SubmitResult> {
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Contact Form <noreply@yourdomain.com>',
                to: import.meta.env.VITE_CONTACT_EMAIL_TO,
                reply_to: data.email,
                subject: `New enquiry from ${data.name}${data.company ? ` — ${data.company}` : ''}`,
                text: [
                    `Name:               ${data.name}`,
                    `Company:            ${data.company || '—'}`,
                    `Email:              ${data.email}`,
                    `Phone:              ${data.phone}`,
                    `Project type:       ${data.projectType}`,
                    `Preferred contact:  ${data.preferredContact || '—'}`,
                    `How they heard:     ${data.referral || '—'}`,
                    '',
                    'Message:',
                    data.message,
                ].join('\n'),
            }),
        });

        if (!res.ok) {
            console.error('Resend error:', await res.json().catch(() => ({})));
            return {
                success: false,
                error: 'Failed to send — please try again or email us directly.',
            };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Something went wrong. Please try again shortly.' };
    }
}

// ─── Field primitives ─────────────────────────────────────────────────────────

const inputClass =
    'w-full bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 px-4 py-3 rounded-xl outline-none transition-colors focus:border-neutral-600';
const selectClass = `${inputClass} appearance-none cursor-pointer`;
const textareaClass = `${inputClass} resize-none`;

const FieldWrapper = ({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) => (
    <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold tracking-widest uppercase text-neutral-400'>
            {label}
            {required && <span className='text-brand-primary ml-1'>*</span>}
        </label>
        {children}
        {error && <p className='text-xs text-red-400 font-medium'>{error}</p>}
    </div>
);

// ─── Form ─────────────────────────────────────────────────────────────────────

const ContactForm = () => {
    const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

    const onSubmit = async (data: ContactFormData) => {
        setSubmitState('idle');
        const result = await submitContactForm(data);
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
            <div className='flex flex-col gap-4 py-16 items-start'>
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <FieldWrapper label='Your name' error={errors.name?.message} required>
                    <input
                        {...register('name')}
                        type='text'
                        placeholder='Jane Smith'
                        autoComplete='name'
                        className={inputClass}
                    />
                </FieldWrapper>
                <FieldWrapper label='Company name' error={errors.company?.message}>
                    <input
                        {...register('company')}
                        type='text'
                        placeholder='Your Company Ltd'
                        autoComplete='organization'
                        className={inputClass}
                    />
                </FieldWrapper>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <FieldWrapper label='Email address' error={errors.email?.message} required>
                    <input
                        {...register('email')}
                        type='email'
                        placeholder='jane@your.company'
                        autoComplete='email'
                        className={inputClass}
                    />
                </FieldWrapper>
                <FieldWrapper label='Contact number' error={errors.phone?.message} required>
                    <input
                        {...register('phone')}
                        type='tel'
                        placeholder='+44'
                        autoComplete='tel'
                        className={inputClass}
                    />
                </FieldWrapper>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <FieldWrapper label='Project type' error={errors.projectType?.message} required>
                    <div className='relative'>
                        <select
                            {...register('projectType')}
                            defaultValue=''
                            className={selectClass}
                        >
                            <option value='' disabled>
                                Select a project type
                            </option>
                            {PROJECT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs'>
                            ▾
                        </span>
                    </div>
                </FieldWrapper>
                <FieldWrapper
                    label='Preferred contact method'
                    error={errors.preferredContact?.message}
                >
                    <div className='relative'>
                        <select
                            {...register('preferredContact')}
                            defaultValue=''
                            className={selectClass}
                        >
                            <option value=''>No preference</option>
                            {CONTACT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs'>
                            ▾
                        </span>
                    </div>
                </FieldWrapper>
            </div>

            <FieldWrapper label='Message' error={errors.message?.message} required>
                <textarea
                    {...register('message')}
                    rows={6}
                    placeholder='Tell us about your project...'
                    className={textareaClass}
                />
            </FieldWrapper>

            <FieldWrapper label='How did you hear about us?' error={errors.referral?.message}>
                <input
                    {...register('referral')}
                    type='text'
                    placeholder='Google, a referral, social media...'
                    className={inputClass}
                />
            </FieldWrapper>

            {submitState === 'error' && <p className='text-sm text-red-400'>{errorMessage}</p>}

            <div className='pt-2'>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-brand-primary cursor-pointer text-ui-background-primary text-sm font-extrabold tracking-widest uppercase px-8 py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
            </div>
        </form>
    );
};

// ─── Section ──────────────────────────────────────────────────────────────────

export const HomeContact = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-white'>
        <div className='max-w-360 w-full flex-1 py-[10vh] flex flex-col px-4 sm:px-6 lg:px-0'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-ui-background-primary leading-none mb-6'>
                Let&apos;s talk
            </h2>
            <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-16'>
                Tell us about your project and we&apos;ll get back to you as soon as possible!
            </p>
            <div className='max-w-3xl mx-auto w-full'>
                <ContactForm />
            </div>
        </div>
    </div>
);
