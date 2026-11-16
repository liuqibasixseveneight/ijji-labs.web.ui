import { clsx } from 'clsx';

import { Section } from '../../atoms';
import type { ServiceDetailBlockProps } from './types.ts';

/** Colours for each band; services alternate dark and light. */
const TONES = {
    dark: {
        number: 'text-white/60',
        title: 'text-white',
        badge: 'text-neutral-400 border-neutral-700',
        tagline: 'text-white/60',
        description: 'text-white/70',
        body: 'text-white/60',
        label: 'text-white/60',
        dot: 'bg-white/40',
        item: 'text-white/70',
    },
    light: {
        number: 'text-neutral-500',
        title: 'text-ui-background-primary',
        badge: 'text-neutral-500 border-neutral-300',
        tagline: 'text-neutral-500',
        description: 'text-neutral-600',
        body: 'text-neutral-500',
        label: 'text-neutral-500',
        dot: 'bg-neutral-400',
        item: 'text-neutral-700',
    },
} as const;

/** One service in full on /services, in a band of its own. */
export const ServiceDetailBlock = ({ service, index }: ServiceDetailBlockProps) => {
    const tone = index % 2 === 0 ? 'dark' : 'light';
    const colours = TONES[tone];

    return (
        <Section tone={tone} spacing='md' id={service.id} labelledBy={`${service.id}-title`}>
            <span
                className={clsx(
                    'text-sm font-bold tracking-widest uppercase mb-6 block',
                    colours.number,
                )}
            >
                {String(index + 1).padStart(2, '0')}
            </span>

            <div className='flex flex-col lg:flex-row lg:items-start lg:gap-16 mb-12'>
                <div className='flex-1'>
                    <h2
                        id={`${service.id}-title`}
                        className={clsx(
                            'text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none mb-4',
                            colours.title,
                        )}
                    >
                        {service.title}

                        {service.optional && (
                            <span
                                className={clsx(
                                    'ml-4 text-base font-medium align-middle px-3 py-1 rounded-full uppercase border tracking-widest',
                                    colours.badge,
                                )}
                            >
                                Optional
                            </span>
                        )}
                    </h2>

                    <p className={clsx('text-xl font-medium', colours.tagline)}>
                        {service.tagline}
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20'>
                <div className='flex flex-col gap-6'>
                    <p className={clsx('text-lg leading-relaxed', colours.description)}>
                        {service.description}
                    </p>

                    {service.body.map((para) => (
                        <p key={para} className={clsx('text-lg leading-relaxed', colours.body)}>
                            {para}
                        </p>
                    ))}
                </div>

                <div>
                    <p className={clsx('text-xs tracking-widest uppercase mb-5', colours.label)}>
                        {service.optional ? 'Available in package' : "What's included"}
                    </p>

                    <ul className='flex flex-col gap-3'>
                        {service.included.map((item) => (
                            <li key={item} className='flex items-start gap-3'>
                                <span
                                    aria-hidden='true'
                                    className={clsx(
                                        'mt-2 w-1.5 h-1.5 rounded-full shrink-0',
                                        colours.dot,
                                    )}
                                />
                                <span className={clsx('text-base', colours.item)}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>
    );
};
