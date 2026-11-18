import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/atoms/Button/Button.tsx';
import { FieldWrapper } from '../../components/ui/atoms/FieldWrapper/FieldWrapper.tsx';
import { Honeypot } from '../../components/ui/atoms/Honeypot/Honeypot.tsx';
import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { TextInput } from '../../components/ui/atoms/TextInput/TextInput.tsx';
import { FormError } from '../../components/ui/molecules/FormStatus/FormStatus.tsx';
import { signIn, type Enrolment } from '../api.ts';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { SignInNavbar } from '../components/AdminNavbar.tsx';
import { signInSchema, type SignInData } from '../schema.ts';

/**
 * Sign in with the admin account's email, password and authenticator code. The check
 * happens in the admin-session function; this page only ever learns "yes" or "no".
 *
 * The first time (while ADMIN_MFA_ENROLL is on), signing in without a code shows a QR code
 * to scan; the next sign-in, with a code from the app, confirms it.
 */
export const SignIn = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [enrol, setEnrol] = useState<Enrolment | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInData>({ resolver: zodResolver(signInSchema) });

    const onSubmit = async (data: SignInData) => {
        setError('');
        const result = await signIn({ ...data, factorId: enrol?.factorId });

        if (result.status === 'signed-in') navigate('/', { replace: true });
        else if (result.status === 'enrol') setEnrol(result.enrol);
        else setError(result.error);
    };

    return (
        // The page's full height in white, as the dashboard's frame is.
        <div className='min-h-svh flex flex-col bg-white'>
            <AdminMeta title='Sign in' />

            <SignInNavbar />
            <main id='main' className='flex-1 flex flex-col bg-white'>
                <Section tone='light' width='text' spacing='lg' labelledBy='sign-in-title'>
                    <div className='w-full max-w-md mx-auto'>
                        <h1 id='sign-in-title' className='text-4xl font-extrabold mb-2'>
                            Admin sign-in
                        </h1>
                        <p className='text-neutral-600 mb-10'>For the ijji labs admin only.</p>

                        {enrol && (
                            <div className='mb-8 flex flex-col gap-4 border border-neutral-200 p-6'>
                                <h2 className='text-lg font-bold'>Set up your authenticator</h2>
                                <p className='text-neutral-600'>
                                    Scan this with your authenticator app, then sign in again with
                                    the 6-digit code it shows.
                                </p>
                                <img
                                    src={enrol.qrCode}
                                    alt='QR code to add the ijji labs admin to your authenticator app'
                                    width={200}
                                    height={200}
                                    className='self-center'
                                />
                                <p className='text-sm text-neutral-600'>
                                    Or enter this key by hand:{' '}
                                    <code className='break-all font-semibold text-neutral-900'>
                                        {enrol.secret}
                                    </code>
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className='relative flex flex-col gap-6'
                        >
                            <Honeypot {...register('website')} />

                            <FieldWrapper
                                label='Email address'
                                error={errors.email?.message}
                                required
                            >
                                <TextInput
                                    {...register('email')}
                                    type='email'
                                    autoComplete='username'
                                />
                            </FieldWrapper>

                            <FieldWrapper
                                label='Password'
                                error={errors.password?.message}
                                required
                            >
                                <TextInput
                                    {...register('password')}
                                    type='password'
                                    autoComplete='current-password'
                                />
                            </FieldWrapper>

                            <FieldWrapper
                                label='Authenticator code'
                                error={errors.code?.message}
                                required
                            >
                                <TextInput
                                    {...register('code')}
                                    type='text'
                                    inputMode='numeric'
                                    autoComplete='one-time-code'
                                    maxLength={6}
                                />
                            </FieldWrapper>

                            {error && <FormError title='Couldn’t sign in' message={error} />}

                            {/* At the end of the row, as on the contact form. */}
                            <div className='w-full flex items-center justify-end'>
                                <Button type='submit' isLoading={isSubmitting} label='Sign in' />
                            </div>
                        </form>
                    </div>
                </Section>
            </main>
        </div>
    );
};
