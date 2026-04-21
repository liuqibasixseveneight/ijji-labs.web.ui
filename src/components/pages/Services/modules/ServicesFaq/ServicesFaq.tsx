import { Accordion, ArtisticFrame, TextLink } from '../../../../ui';
import { faqData } from '../../servicesData.ts';

export const ServicesFaq = () => (
    <div
        id='faq'
        className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'
    >
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10 leading-none'>
                FAQ
            </h2>
            <p className='text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-16'>
                Straightforward answers to the questions we hear most often. If yours isn't here,{' '}
                <TextLink to='/contact' underline='always' className='text-white'>
                    just ask
                </TextLink>
                .
            </p>

            <ArtisticFrame className='bg-white px-6 md:px-10 py-2'>
                <Accordion items={faqData} />
            </ArtisticFrame>
        </div>
    </div>
);
