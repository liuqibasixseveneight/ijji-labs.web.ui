import { ProcessTable } from '../../../../ui';
import { stepsData } from '../../../Home/modules/HomeServices/stepsData.ts';

export const ServicesProcess = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-white'>
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-ui-background-primary mb-10 leading-none'>
                Our process
            </h2>
            <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-16'>
                Every project follows the same eight steps — so you always know where you are, what
                comes next, and why.
            </p>

            <ProcessTable steps={stepsData} />
        </div>
    </div>
);
