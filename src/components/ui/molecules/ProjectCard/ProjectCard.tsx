import type { ProjectCardProps } from './types.ts';
import { ArtisticFrame } from '../../atoms';

export const ProjectCard = ({
    id,
    name,
    description,
    services,
    mockup,
    flip = false,
}: ProjectCardProps) => {
    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                flip ? 'border-y border-neutral-900 py-[5vh]' : ''
            }`}
        >
            <ArtisticFrame
                cutSize={32}
                className={`aspect-4/3 bg-neutral-900 ${flip ? 'md:order-last' : ''}`}
            >
                {mockup ? (
                    <img
                        src={mockup}
                        alt={`${name} screenshot`}
                        className='w-full h-full object-cover object-top'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <span className='text-neutral-700 text-xs tracking-widest uppercase font-semibold'>
                            {name}
                        </span>
                    </div>
                )}
            </ArtisticFrame>

            <div className={`flex flex-col gap-4 ${flip ? 'md:order-first' : ''}`}>
                <p className='text-sm sm:text-base text-neutral-400 leading-relaxed uppercase font-semibold'>
                    {id}
                </p>

                <h3 className='text-4xl sm:text-5xl font-extrabold text-white leading-none'>
                    {name}
                </h3>
                <p className='text-sm sm:text-base text-neutral-400 leading-relaxed max-w-sm'>
                    {description}
                </p>
                <div className='flex flex-wrap gap-2 mt-4 max-w-120'>
                    {services.map((s) => (
                        <span
                            key={s}
                            className='text-xs font-bold tracking-widest uppercase text-neutral-400 border border-neutral-800 px-3 py-1 rounded-full'
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
