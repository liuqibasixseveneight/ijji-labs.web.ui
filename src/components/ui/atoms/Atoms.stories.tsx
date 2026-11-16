import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { aboutImageOne } from '../../../assets/images';
import { ArtisticFrame } from './ArtisticFrame';
import { ResponsiveImage } from './ResponsiveImage';
import { BadgeLink } from './BadgeLink';
import { HamburgerIcon } from './HamburgerIcon';
import { Logo } from './Logo';
import { NavbarLink } from './NavbarLink';
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

/** Inline link, as in the FAQ's "just ask". */
export const InlineLink: Story = {
    render: () => (
        <p className='text-lg'>
            If yours isn&apos;t here,{' '}
            <TextLink to='/contact' underline='always'>
                just ask
            </TextLink>
            . Or one that underlines on hover: <TextLink to='/contact'>contact</TextLink>.
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
