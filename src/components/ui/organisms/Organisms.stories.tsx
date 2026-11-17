import type { Meta, StoryObj } from '@storybook/react-vite';

import {
    processSteps,
    faqs as faqData,
    serviceCards as cardData,
    services as servicesData,
} from '../../../content';
import { Accordion } from './Accordion';
import { FluidGradient } from './FluidGradient';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { ProcessTable } from './ProcessTable';
import { ServiceCards } from './ServiceCards';
import { ServiceDetailBlock } from './ServiceDetailBlock';

const meta = {
    title: 'Organisms',
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Top of every page, see-through at the top. Press the hamburger to open the menu. Scroll
 * the canvas and the dark background eases in (here, as on Home, once most of the first
 * screen has gone by; on other pages over the first 160px).
 */
export const NavbarOnPage: Story = {
    render: () => (
        <>
            <Navbar />
            <div className='h-[300vh] -mt-20 bg-linear-to-b from-brand-primary to-white' />
        </>
    ),
};

/** Over a dark home palette, the logo and icon turn white. */
export const NavbarOverDark: Story = {
    globals: { backgrounds: { value: 'dark' } },
    render: () => <Navbar isGradientDark />,
};

export const SiteFooter: Story = { render: () => <Footer /> };

/** The home hero background: WebGL fluid, with the palette picker bottom right. */
export const Gradient: Story = {
    render: () => (
        <div className='relative h-screen'>
            <FluidGradient showPalettePicker />
        </div>
    ),
};

export const Faq: Story = {
    parameters: { layout: 'padded' },
    render: () => <Accordion items={faqData} />,
};

export const Process: Story = {
    parameters: { layout: 'padded' },
    render: () => <ProcessTable steps={processSteps} />,
};

export const Services: Story = {
    globals: { backgrounds: { value: 'dark' } },
    parameters: { layout: 'padded' },
    render: () => <ServiceCards cardData={cardData} />,
};

/** One service on /services; they alternate dark and light. */
export const ServiceDetailDark: Story = {
    render: () => <ServiceDetailBlock service={servicesData[0]} index={0} />,
};

export const ServiceDetailLight: Story = {
    render: () => <ServiceDetailBlock service={servicesData[2]} index={2} />,
};

/** Apps, our newest service. */
export const ServiceDetailApps: Story = {
    render: () => <ServiceDetailBlock service={servicesData[1]} index={1} />,
};

export const ServiceDetailOptional: Story = {
    render: () => <ServiceDetailBlock service={servicesData[3]} index={3} />,
};
