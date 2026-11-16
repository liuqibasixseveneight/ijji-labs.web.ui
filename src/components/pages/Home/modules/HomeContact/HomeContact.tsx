import { ContactForm } from '../../../../ui';

export const HomeContact = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-white'>
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-ui-background-primary leading-none mb-6'>
                Let&apos;s talk
            </h2>
            <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-10'>
                Tell us about your project and we&apos;ll get back to you as soon as possible!
            </p>

            <div className='mx-auto w-full pt-10'>
                <ContactForm />
            </div>
        </div>
    </div>
);
