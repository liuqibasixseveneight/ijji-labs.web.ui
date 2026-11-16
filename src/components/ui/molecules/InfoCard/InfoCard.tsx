import type { InfoCardProps } from './types.ts';
import { ArtisticFrame } from '../../atoms';

export const InfoCard = ({ number, title, description }: InfoCardProps) => {
    return (
        <ArtisticFrame className='bg-neutral-100 h-full'>
            <div className='flex flex-col gap-4 p-8 w-full h-full'>
                <span className='text-xs text-neutral-600 tracking-widest select-none'>
                    {number}
                </span>
                <div className='w-12 h-px bg-neutral-300' />
                <h3 className='text-xl font-semibold tracking-tight text-neutral-900'>{title}</h3>
                <p className='text-base leading-relaxed text-neutral-600'>{description}</p>
            </div>
        </ArtisticFrame>
    );
};
