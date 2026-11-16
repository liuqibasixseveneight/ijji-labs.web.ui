import { homeCopy, serviceCards } from '../../../../../content';
import { paths } from '../../../../../router/paths.ts';
import { MoreLink, ProcessSection, Section, SectionIntro, ServiceCards } from '../../../../ui';

export const HomeServices = () => (
    <>
        <Section tone='dark' labelledBy='home-services-title'>
            <SectionIntro
                id='home-services-title'
                title={homeCopy.services.title}
                lede={homeCopy.services.lede}
            />
            <ServiceCards cardData={serviceCards} />
            <div className='mt-[8vh] flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between'>
                <em className='text-neutral-400'>{homeCopy.services.note}</em>
                <MoreLink to={paths.services}>All services</MoreLink>
            </div>
        </Section>

        <ProcessSection />
    </>
);
