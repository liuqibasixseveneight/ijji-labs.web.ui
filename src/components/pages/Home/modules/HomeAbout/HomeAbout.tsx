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
        {/* One dark band: the heading, who we are, then the photo. The text keeps a comfortable
        line length. */}
        <Section tone='dark' labelledBy='home-about-title'>
            <SectionIntro id='home-about-title' title='About us' />
            <div className='flex flex-col max-w-260 mb-16'>
                <SectionIntro size='heading' level={3} title={homeCopy.about.title} />
                <div className='flex flex-col gap-8'>
                    {homeCopy.about.paragraphs.map((paragraph) => (
                        <p key={paragraph} className='text-xl text-white/70'>
                            {paragraph}
                        </p>
                    ))}
                </div>
                <MoreLink to={paths.about} className='mt-10'>
                    More about us
                </MoreLink>
            </div>
            <ArtisticFrame className='w-full'>
                <ResponsiveImage
                    image={aboutImageOne}
                    alt='Shared computer office working space'
                    className='block w-full h-auto max-h-[65vh] object-cover'
                />
            </ArtisticFrame>
        </Section>

        <Section tone='light' innerClassName='pb-[10vh]' labelledBy='home-values-title'>
            <SectionIntro
                id='home-values-title'
                tone='light'
                title={homeCopy.values.title}
                lede={homeCopy.values.lede}
            />
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
