import { aboutImageOne, aboutImageTwo } from '../../../assets/images';
import { aboutCopy, pageMeta, valueCards } from '../../../content';
import { contactAbout, paths } from '../../../router/paths.ts';
import {
    ArtisticFrame,
    CtaBand,
    InfoCard,
    MoreLink,
    PageHero,
    PageMeta,
    ResponsiveImage,
    Section,
    SectionIntro,
    StructuredData,
    TextSection,
} from '../../ui';
import * as ld from '../../../content/structuredData.ts';

const LINKS = [
    { label: 'Our story', href: '#our-story' },
    { label: 'Why independent?', href: '#why-independent' },
    { label: 'Your ownership', href: '#your-ownership' },
    { label: 'Our own apps', href: '#our-own-apps' },
    { label: 'What we stand for', href: '#what-we-stand-for' },
];

export const About = () => (
    <>
        <PageMeta {...pageMeta.about} />
        <StructuredData
            data={ld.webPage(
                pageMeta.about.path,
                'About ijji labs',
                pageMeta.about.description,
                'AboutPage',
            )}
        />

        <PageHero
            title={aboutCopy.hero.title}
            lede={[aboutCopy.hero.lede]}
            links={LINKS}
            image={{ source: aboutImageOne, alt: 'Shared computer office working space' }}
        />

        <TextSection id='our-story' title='Our story' paragraphs={aboutCopy.story} />

        <TextSection
            id='why-independent'
            title='Why independent?'
            paragraphs={aboutCopy.independent}
            tone='dark'
        />
        <Section tone='dark' width='media' spacing='sm'>
            <ArtisticFrame className='w-full'>
                <ResponsiveImage
                    image={aboutImageTwo}
                    alt='Two designers collaborating with laptops'
                    className='block w-full h-auto max-h-[65vh] object-cover'
                />
            </ArtisticFrame>
        </Section>

        <TextSection
            id='your-ownership'
            title='Your site, your ownership'
            paragraphs={aboutCopy.ownership}
        />

        <TextSection
            id='our-own-apps'
            title='Our own apps'
            paragraphs={aboutCopy.ownApps}
            tone='dark'
        >
            <MoreLink to={paths.apps}>See our apps</MoreLink>
        </TextSection>

        <Section
            id='what-we-stand-for'
            tone='light'
            width='grid'
            spacing='sm'
            labelledBy='what-we-stand-for-title'
        >
            <SectionIntro
                id='what-we-stand-for-title'
                tone='light'
                size='heading'
                title='What we stand for'
            />
            <ul className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
                {valueCards.map((card) => (
                    <li key={card.number}>
                        <InfoCard {...card} />
                    </li>
                ))}
            </ul>
        </Section>

        <TextSection title='We really care' paragraphs={aboutCopy.care} />

        <CtaBand
            title='Got something in mind?'
            lede='A website, an app, or just an idea you’re turning over — we’d love to hear about it.'
            action={{ label: 'Get in touch', to: contactAbout('website') }}
        />
    </>
);
