import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { projects, valueCards } from '../../../content';
import { navbarItems } from '../organisms/Navbar/navbarItems.ts';
import { AccordionItem } from './AccordionItem';
import { BadgeLinks } from './BadgeLinks';
import { InfoCard } from './InfoCard';
import { NavMenu } from './NavMenu';
import { PalettePicker, type PaletteKey } from './PalettePicker';
import { ProjectCard } from './ProjectCard';
import { ServiceCard } from './ServiceCard';

const meta = {
    title: 'Molecules',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FaqDemo = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <AccordionItem
            question='How long does a project typically take?'
            answer='Most projects run between 6 and 12 weeks from kick-off to launch.'
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
        />
    );
};

const PalettesDemo = () => {
    const [active, setActive] = useState<PaletteKey>('silk');
    return (
        <div className='pt-12'>
            <PalettePicker activeKey={active} onChange={setActive} />
        </div>
    );
};

const dark = { globals: { backgrounds: { value: 'dark' } } };

/** One FAQ entry; press to open. */
export const FaqItem: Story = {
    render: () => <FaqDemo />,
};

/** The jump links under About, Services and Projects heroes. */
export const JumpLinks: Story = {
    ...dark,
    render: () => (
        <BadgeLinks
            links={[
                { label: 'Our story', href: '#our-story' },
                { label: 'Why independent?', href: '#why-independent' },
                { label: 'Your ownership', href: '#your-ownership' },
            ]}
        />
    ),
};

/** A value, as on Home and About. */
export const ValueCard: Story = {
    render: () => (
        <div className='max-w-xs'>
            <InfoCard {...valueCards[0]} />
        </div>
    ),
};

/**
 * The full-screen menu, open. Hover an item: its name rolls to yellow, a yellow line sweeps
 * under it and its number shows behind. The page you're on stays yellow.
 */
export const Menu: Story = {
    parameters: { layout: 'fullscreen' },
    render: () => <NavMenu isOpen setIsOpen={fn()} links={navbarItems} />,
};

/** Bottom-right of the home hero: three light palettes, then three dark. */
export const Palettes: Story = {
    render: () => <PalettesDemo />,
};

/** A project on Home and /projects. */
export const Project: Story = { ...dark, render: () => <ProjectCard {...projects[0]} /> };

/** Every second project swaps sides. */
export const ProjectFlipped: Story = {
    ...dark,
    render: () => <ProjectCard {...projects[1]} flip />,
};

/** Without a screenshot yet. */
export const ProjectNoImage: Story = {
    ...dark,
    render: () => <ProjectCard {...projects[2]} mockup={undefined} />,
};

export const Service: Story = {
    ...dark,
    render: () => (
        <div className='max-w-md'>
            <ServiceCard
                title='Handover & Training'
                description='Every project ends with a thorough handover.'
                included={['Walkthrough session', 'Documentation']}
            />
        </div>
    ),
};

export const ServiceOptional: Story = {
    ...dark,
    render: () => (
        <div className='max-w-md'>
            <ServiceCard
                title='Post-Launch Support'
                description='A flexible support package, if you want one.'
                included={['Content updates', 'Monitoring']}
                optional
            />
        </div>
    ),
};
