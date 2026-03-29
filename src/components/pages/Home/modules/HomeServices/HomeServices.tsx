const services = [
    {
        title: 'Website Design & Development',
        description:
            'From concept to code — we design and build fast, modern websites tailored to your business. Every detail is considered, every page signed off by you before we build.',
        included: [
            'UX & visual design',
            'Responsive development',
            'Performance & accessibility',
            'Third-party integrations',
        ],
    },
    {
        title: 'Handover & Training',
        description:
            'Every project ends with a thorough handover. We provide documentation and a walkthrough session so you can manage your own content confidently — no ongoing dependency on us required.',
        included: [
            'Content management training',
            'Written documentation',
            'Walkthrough session',
            'Q&A before sign-off',
        ],
    },
    {
        title: 'Ongoing Support',
        description:
            "If you'd rather not manage updates yourself, we offer a flexible support package. Maintenance, content changes, and future development available at an agreed rate.",
        included: ['Content & copy updates', 'Software & plugin updates', 'Performance monitoring'],
        optional: true,
    },
];

const steps = [
    {
        number: '01',
        title: 'Discovery & Planning',
        description:
            'We learn about your business, audience, and goals — then align on scope, timeline, and deliverables before anything is designed.',
    },
    {
        number: '02',
        title: 'Concept & Initial Design',
        description:
            'Low-fidelity mockups to establish layout, structure, and aesthetic direction. A conversation starter we refine together.',
    },
    {
        number: '03',
        title: 'High-Fidelity Design',
        description:
            'Detailed designs for every page and interaction, signed off by you before a line of code is written.',
    },
    {
        number: '04',
        title: 'Development',
        description:
            'We build to spec — every feature, integration, and responsive behaviour — with performance and accessibility throughout.',
    },
    {
        number: '05',
        title: 'Testing & Review',
        description:
            'In-house testing across devices and browsers, followed by a client acceptance window to confirm everything is functioning as expected.',
    },
    {
        number: '06',
        title: 'Launch',
        description:
            'We publish your site and verify every form, integration, and system is live and working from day one.',
    },
    {
        number: '07',
        title: 'Handover & Training',
        description:
            'Full documentation, a walkthrough session, and your questions answered — so you leave confident, not dependent.',
    },
    {
        number: '08',
        title: 'Post-Launch Support',
        description:
            'The project completes at handover. Ongoing maintenance and updates are available at an agreed rate whenever you need us.',
    },
];

export const HomeServices = () => {
    return (
        <>
            <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
                <div className='max-w-360 w-full flex-1 py-[10vh] flex flex-col px-4 sm:px-6 lg:px-0'>
                    <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10 leading-none'>
                        Our services
                    </h2>
                    <p className='text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-16'>
                        We keep our offering focused — so every project gets our full attention, not
                        a fraction of it.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800'>
                        {services.map((service) => (
                            <div
                                key={service.title}
                                className='flex flex-col gap-6 bg-ui-background-primary p-8 lg:p-10'
                            >
                                <div className='flex items-start justify-between gap-4'>
                                    <h3 className='text-lg sm:text-xl font-semibold text-white leading-snug'>
                                        {service.title}
                                    </h3>
                                    {service.optional && (
                                        <span className='shrink-0 text-xs font-bold tracking-widest uppercase text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-full'>
                                            Optional
                                        </span>
                                    )}
                                </div>

                                <p className='text-sm sm:text-base text-neutral-400 leading-relaxed min-h-28'>
                                    {service.description}
                                </p>

                                <ul className='flex flex-col gap-2 border-t border-neutral-800 pt-6'>
                                    {service.included.map((item) => (
                                        <li
                                            key={item}
                                            className='flex items-center gap-3 text-sm text-neutral-400'
                                        >
                                            <span className='w-1 h-1 rounded-full bg-neutral-500 shrink-0' />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-white'>
                <div className='max-w-360 w-full flex-1 py-[10vh] flex flex-col px-4 sm:px-6 lg:px-0'>
                    <p className='text-xs font-bold tracking-[0.25em] uppercase text-neutral-400 mb-5'>
                        How we work
                    </p>
                    <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-black mb-10 leading-none'>
                        Our process
                    </h2>
                    <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-16'>
                        Every project follows the same eight steps — so you always know where you
                        are, what comes next, and why.
                    </p>

                    <div className='w-full'>
                        <div className='hidden md:grid md:grid-cols-[3.5rem_1fr_1.6fr] gap-x-10 pb-4 border-b border-neutral-200'>
                            <span className='text-xs font-bold tracking-[0.2em] uppercase text-neutral-400'>
                                Step
                            </span>
                            <span className='text-xs font-bold tracking-[0.2em] uppercase text-neutral-400'>
                                Phase
                            </span>
                            <span className='text-xs font-bold tracking-[0.2em] uppercase text-neutral-400'>
                                What happens
                            </span>
                        </div>

                        {steps.map((step, i) => (
                            <div
                                key={step.number}
                                className={`
                                    border-b py-6 md:py-7
                                    grid grid-cols-[3.5rem_1fr] md:grid-cols-[3.5rem_1fr_1.6fr]
                                    gap-x-6 md:gap-x-10 gap-y-2
                                    ${i === 0 ? 'border-t border-t-neutral-200' : ''}
                                    ${i === steps.length - 1 ? 'border-neutral-200' : 'border-neutral-100'}
                                `}
                            >
                                <span className='text-sm font-mono font-semibold text-neutral-400 row-span-2 md:row-span-1 flex items-start md:items-center'>
                                    {step.number}
                                </span>
                                <span className='text-base sm:text-lg font-semibold text-black leading-snug flex items-center'>
                                    {step.title}
                                </span>
                                <p className='col-start-2 md:col-start-3 text-sm sm:text-base text-neutral-500 leading-relaxed flex items-center'>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
