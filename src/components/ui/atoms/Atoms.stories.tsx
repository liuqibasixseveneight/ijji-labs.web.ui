import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { aboutImageOne } from '../../../assets/images';
import { ArtisticFrame } from './ArtisticFrame';
import { ResponsiveImage } from './ResponsiveImage';
import { BadgeLink } from './BadgeLink';
import { HamburgerIcon } from './HamburgerIcon';
import { Logo } from './Logo';
import { NavbarLink } from './NavbarLink';
import { RichText } from './RichText';
import { ScrollIndicator } from './ScrollIndicator';
import { TextLink } from './TextLink';
import { Tooltip } from './Tooltip';

/** The small pieces. Button and the form fields have their own pages. */
const meta = {
    title: 'Atoms/Gallery',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const HamburgerDemo = () => {
    const [isOpen, setIsOpen] = useState(false);
    return <HamburgerIcon isOpen={isOpen} setIsOpen={() => setIsOpen(!isOpen)} isWhite />;
};

const dark = { globals: { backgrounds: { value: 'dark' } } };

/** The corner-cut frame used for images, cards and the FAQ. */
export const Frame: Story = {
    render: () => (
        <ArtisticFrame className='w-96 h-64'>
            <ResponsiveImage
                image={aboutImageOne}
                alt='Office'
                className='w-full h-full object-cover'
            />
        </ArtisticFrame>
    ),
};

/** In-page jump links under each hero. */
export const Badge: Story = {
    ...dark,
    render: () => <BadgeLink label='Our story' href='#our-story' />,
};

/** Toggles the full-screen menu; turns into a cross when open. */
export const Hamburger: Story = {
    ...dark,
    render: () => <HamburgerDemo />,
};

export const LogoOnLight: Story = { render: () => <Logo /> };

export const LogoOnDark: Story = { ...dark, render: () => <Logo isWhite /> };

/** Footer links; the current page stays yellow and underlined. */
export const FooterLink: Story = {
    ...dark,
    render: () => (
        <ul className='flex gap-10 text-ui-text-secondary'>
            <NavbarLink text='Current page' to='/' />
            <NavbarLink text='Another page' to='/about' />
        </ul>
    ),
};

/** Inline link, as in the FAQ's "just ask": a yellow marker stroke that rises on hover. */
export const InlineLink: Story = {
    render: () => (
        <div className='flex flex-col'>
            <p className='text-lg text-white/60 bg-ui-background-primary p-8'>
                On a dark section: if yours isn&apos;t here,{' '}
                <TextLink to='/contact'>just ask</TextLink>.
            </p>
            <p className='text-lg text-neutral-600 bg-white p-8'>
                On a light section: if yours isn&apos;t here,{' '}
                <TextLink to='/contact' tone='light'>
                    just ask
                </TextLink>
                .
            </p>
        </div>
    ),
};

/**
 * Policy text: plain runs, bold, and links (in-site, email, other sites). Links have a slim
 * yellow underline that the yellow sweeps across on hover or focus. They don't roll, so a
 * long link wraps across lines (the narrow column shows it). Other sites open in a new tab
 * and say so.
 */
export const PolicyText: Story = {
    render: () => (
        <p className='max-w-xs text-lg leading-relaxed text-neutral-700 bg-white p-8'>
            <RichText
                text={[
                    'Delete it in the app, or ',
                    {
                        text: 'ask us to delete your account',
                        href: '/apps/ijji-tracker/delete-account',
                    },
                    '. Email ',
                    { text: 'support@ijji-labs.com', href: 'mailto:support@ijji-labs.com' },
                    ' or ',
                    { text: 'send us a message', href: '/contact?topic=support' },
                    '. You can also complain to ',
                    { text: 'the ICO', href: 'https://ico.org.uk' },
                    '. ',
                    { strong: 'We never sell your data.' },
                ]}
            />
        </p>
    ),
};

/** Bottom of the home hero; fades once the page scrolls. */
export const Scroll: Story = {
    render: () => (
        <div className='relative h-48'>
            <ScrollIndicator isGradientDark={false} />
        </div>
    ),
};

/** Names a palette swatch on hover. */
export const PaletteTooltip: Story = {
    render: () => (
        <div className='relative mt-12 ml-24'>
            <Tooltip label='Silk' x={0} />
        </div>
    ),
};
