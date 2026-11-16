import type { ServiceDetailBlockProps } from './types.ts';

export const ServiceDetailBlock = ({ service, index }: ServiceDetailBlockProps) => {
    const isEven = index % 2 === 0;

    return (
        <div
            className={`w-full py-[8vh] ${isEven ? 'bg-ui-background-primary' : 'bg-white'}`}
            id={`service-${index + 1}`}
        >
            <div className='max-w-380 w-full mx-auto px-6 md:px-8'>
                <span
                    className={`text-sm font-bold tracking-widest uppercase mb-6 block ${
                        isEven ? 'text-white/30' : 'text-neutral-400'
                    }`}
                >
                    0{index + 1}
                </span>

                <div className='flex flex-col lg:flex-row lg:items-start lg:gap-16 mb-12'>
                    <div className='flex-1'>
                        <h2
                            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none mb-4 ${
                                isEven ? 'text-white' : 'text-ui-background-primary'
                            }`}
                        >
                            {service.title}

                            {service.optional && (
                                <span
                                    className={`ml-4 text-base font-medium align-middle px-3 py-1 rounded-full uppercase border tracking-widest ${
                                        isEven
                                            ? 'text-neutral-400 border-neutral-700'
                                            : 'text-neutral-400 border-neutral-300'
                                    }`}
                                >
                                    Optional
                                </span>
                            )}
                        </h2>

                        <p
                            className={`text-xl font-medium ${
                                isEven ? 'text-white/60' : 'text-neutral-500'
                            }`}
                        >
                            {service.tagline}
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20'>
                    <div className='flex flex-col gap-6'>
                        <p
                            className={`text-lg leading-relaxed ${
                                isEven ? 'text-white/70' : 'text-neutral-600'
                            }`}
                        >
                            {service.description}
                        </p>

                        {service.body.map((para, i) => (
                            <p
                                key={i}
                                className={`text-lg leading-relaxed ${
                                    isEven ? 'text-white/60' : 'text-neutral-500'
                                }`}
                            >
                                {para}
                            </p>
                        ))}
                    </div>

                    <div>
                        <p
                            className={`text-xs tracking-widest uppercase mb-5 ${
                                isEven ? 'text-white/30' : 'text-neutral-400'
                            }`}
                        >
                            {service.optional ? 'Available in package' : "What's included"}
                        </p>

                        <ul className='flex flex-col gap-3'>
                            {service.included.map((item, i) => (
                                <li key={i} className='flex items-start gap-3'>
                                    <span
                                        className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${
                                            isEven ? 'bg-white/40' : 'bg-neutral-400'
                                        }`}
                                    />
                                    <span
                                        className={`text-base ${
                                            isEven ? 'text-white/70' : 'text-neutral-700'
                                        }`}
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
