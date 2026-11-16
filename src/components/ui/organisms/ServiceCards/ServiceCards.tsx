import type { ServiceCardsProps } from './types.ts';
import { ServiceCard } from '../../molecules';

export const ServiceCards = ({ cardData }: ServiceCardsProps) => {
    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-px mx-auto'>
            {cardData.map((card, index: number) => (
                <ServiceCard key={`${card.title}-${index}`} {...card} />
            ))}
        </div>
    );
};
