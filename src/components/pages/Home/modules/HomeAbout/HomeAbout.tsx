import { aboutImageOne } from '../../../../../assets/images';
import { homeCopy, valueCards } from '../../../../../content';
import { paths } from '../../../../../router/paths.ts';
import {
    ArtisticFrame,
    InfoCard,
    MoreLink,
    ResponsiveImage,
    Section,
    SectionIntro,
} from '../../../../ui';

export const HomeAbout = () => (
    <>
        <Section tone='dark' labelledBy='home-about-title'>
            <SectionIntro id='home-about-title' title='About us' />
            <ArtisticFrame className='w-full'>
                <ResponsiveImage
                    image={aboutImageOne}
                    alt='Shared computer office working space'
                    className='block w-full h-auto max-h-[65vh] object-cover'
                />
            </ArtisticFrame>
        </Section>

        <Section tone='light' width='text'>
            <SectionIntro tone='light' size='heading' level={3} title={homeCopy.about.title} />
            <div className='flex flex-col gap-8'>
                {homeCopy.about.paragraphs.map((paragraph) => (
                    <p key={paragraph} className='text-xl'>
                        {paragraph}
                    </p>
                ))}
            </div>
            <MoreLink to={paths.about} tone='light' className='mt-10'>
                More about us
            </MoreLink>
        </Section>

        <Section tone='light' width='grid' spacing='sm' innerClassName='pb-[10vh]'>
            <SectionIntro tone='light' size='heading' level={3} title='What we value' />
            <ul className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
                {valueCards.map((card) => (
                    <li key={card.number}>
                        <InfoCard {...card} />
                    </li>
                ))}
            </ul>
        </Section>
    </>
);
