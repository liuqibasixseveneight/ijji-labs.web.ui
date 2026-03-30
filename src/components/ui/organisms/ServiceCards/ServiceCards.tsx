import type { ServiceCardsProps } from './types.ts';
import { ServiceCard } from '../../molecules';

export const ServiceCards = ({ cardData }: ServiceCardsProps) => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800 max-w-7xl mx-auto'>
            {cardData.map((card, index: number) => (
                <ServiceCard key={`${card.title}-${index}`} {...card} />
            ))}
        </div>
    );
};
