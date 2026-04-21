import { InfoCard } from '../../../../ui';
import { valueCards } from '../../../Home/modules/HomeAbout/valueCards.ts';

export const AboutValues = () => (
    <div
        id='what-we-stand-for'
        className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-white'
    >
        <div className='max-w-7xl w-full flex-1 flex flex-col px-6 md:px-8'>
            <h2 className='text-3xl md:text-4xl font-medium mb-10'>What we stand for</h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {valueCards.map((card, index: number) => (
                    <InfoCard key={`${card?.title}-${index}`} {...card} />
                ))}
            </div>
        </div>
    </div>
);
