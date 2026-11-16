import { ServiceCards } from '../../../../ui';
import { ServicesProcess } from '../../../Services/modules';
import { cardData } from './cardData.ts';

export const HomeServices = () => (
    <>
        <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
            <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8'>
                <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10 leading-none'>
                    Our services
                </h2>
                <p className='text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-16'>
                    We keep our offering focused — so every project gets our full attention, not a
                    fraction of it.
                </p>

                <ServiceCards cardData={cardData} />

                <em className='text-neutral-400 mt-[10vh]'>
                    Any additional features can be developed at an agreed extra cost.
                </em>
            </div>
        </div>

        <ServicesProcess />
    </>
);
