import type { ProjectCardProps } from './types.ts';
import { ArtisticFrame } from '../../atoms';
import { cdnImage } from './cdnImage.ts';

export const ProjectCard = ({
    number,
    anchor,
    name,
    description,
    services,
    mockup,
    flip = false,
}: ProjectCardProps) => {
    return (
        <div
            id={anchor}
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
                        src={cdnImage(mockup, 960)}
                        srcSet={[480, 720, 960, 1280]
                            .map((w) => `${cdnImage(mockup, w)} ${w}w`)
                            .join(', ')}
                        sizes='(min-width: 768px) 50vw, 100vw'
                        width={1200}
                        height={900}
                        loading='lazy'
                        decoding='async'
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
                    {number}
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
