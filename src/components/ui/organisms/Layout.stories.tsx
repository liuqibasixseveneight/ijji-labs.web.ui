import type { Meta, StoryObj } from '@storybook/react-vite';

import { aboutImageOne } from '../../../assets/images';
import { aboutCopy } from '../../../content';
import { MoreLink, Section } from '../atoms';
import { FormError, FormSuccess, SectionIntro } from '../molecules';
import { CtaBand } from './CtaBand';
import { PageHero } from './PageHero';
import { TextSection } from './TextSection';

/**
 * The building blocks every page is made of. Sections alternate dark (#121212) and white,
 * at one of four widths; headings and ledes colour themselves for the band they sit in.
 */
const meta = {
    title: 'Layout',
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The top of every page but Home. */
export const Hero: Story = {
    render: () => (
        <PageHero
            title='About us'
            lede={[aboutCopy.hero.lede]}
            links={[
                { label: 'Our story', href: '#our-story' },
                { label: 'Why independent?', href: '#why-independent' },
            ]}
            image={{ source: aboutImageOne, alt: 'Office' }}
        />
    ),
};

/** A dark band and a white band, with their intros and onward links. */
export const Sections: Story = {
    render: () => (
        <>
            <Section tone='dark'>
                <SectionIntro title='Our services' lede='A dark band, with a display heading.' />
                <MoreLink to='/services'>All services</MoreLink>
            </Section>
            <Section tone='light'>
                <SectionIntro tone='light' title='Our process' lede='A white band.' />
                <MoreLink to='/services' tone='light'>
                    All services
                </MoreLink>
            </Section>
        </>
    ),
};

/** Running text at reading width. */
export const Text: Story = {
    render: () => <TextSection id='our-story' title='Our story' paragraphs={aboutCopy.story} />,
};

export const TextOnDark: Story = {
    render: () => (
        <TextSection title='Our own apps' paragraphs={aboutCopy.ownApps} tone='dark'>
            <MoreLink to='/apps'>See our apps</MoreLink>
        </TextSection>
    ),
};

/** The closing call to action. */
export const CallToAction: Story = {
    render: () => (
        <CtaBand
            title='Got something in mind?'
            lede='A website, an app, or just an idea you’re turning over.'
            action={{ label: 'Get in touch', to: '/contact' }}
        />
    ),
};

/** What a form shows once sent, and when sending fails. */
export const FormOutcomes: Story = {
    parameters: { layout: 'padded' },
    render: () => (
        <div className='flex flex-col gap-8 max-w-2xl'>
            <FormSuccess
                title='Message sent!'
                message='Thanks for reaching out. We’ll be in touch within one business day.'
                actionLabel='Send another message'
                onAction={() => {}}
            />
            <FormError
                title='Failed to send message'
                message='Failed to send — please try again.'
            />
        </div>
    ),
};
