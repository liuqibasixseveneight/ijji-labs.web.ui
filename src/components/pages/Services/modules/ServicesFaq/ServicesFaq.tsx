import { faqs } from '../../../../../content';
import { paths } from '../../../../../router/paths.ts';
import { Accordion, ArtisticFrame, Section, SectionIntro, TextLink } from '../../../../ui';

export const ServicesFaq = () => (
    <Section id='faq' tone='dark' labelledBy='faq-title'>
        <SectionIntro
            id='faq-title'
            title='FAQ'
            lede={
                <>
                    Straightforward answers to the questions we hear most often. If yours isn&apos;t
                    here,{' '}
                    <TextLink to={paths.contact} underline='always' className='text-white'>
                        just ask
                    </TextLink>
                    .
                </>
            }
        />

        <ArtisticFrame className='bg-white px-6 md:px-10 py-2'>
            <Accordion items={faqs} />
        </ArtisticFrame>
    </Section>
);
