import { ContactForm } from '../../../../ui';
import { EXPECTATIONS } from './expectations.ts';

export const ContactEmailForm = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[8vh] bg-white'>
        <div className='max-w-380 w-full flex-1 flex flex-col px-6 md:px-8'>
            <div className='flex flex-col lg:flex-row gap-16 lg:gap-24'>
                <div className='flex-1'>
                    <h2 className='text-2xl font-semibold mb-10'>Send us a message</h2>
                    <ContactForm />
                </div>

                <div className='lg:max-w-xs w-full flex flex-col gap-0 divide-y divide-neutral-200 self-start lg:pt-13'>
                    {EXPECTATIONS.map(({ title, description }) => (
                        <div key={title} className='py-8 flex flex-col gap-2'>
                            <h3 className='text-base font-semibold'>{title}</h3>
                            <p className='text-base text-neutral-500 leading-relaxed'>
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
