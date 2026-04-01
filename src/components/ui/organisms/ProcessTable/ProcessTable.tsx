import type { ProcessTableProps } from './types.ts';

export const ProcessTable = ({ steps }: ProcessTableProps) => {
    return (
        <div className='w-full max-w-7xl mx-auto'>
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

            {steps.map((step, index) => (
                <div
                    key={step.number}
                    className={`
                        border-b last:border-b-0 py-6 md:py-7
                        grid grid-cols-[3.5rem_1fr] md:grid-cols-[3.5rem_1fr_1.6fr]
                        gap-x-6 md:gap-x-10 gap-y-2
                        ${index === 0 ? 'border-t border-t-neutral-200' : ''}
                        ${index === steps.length - 1 ? 'border-neutral-200' : 'border-neutral-100'}
                    `}
                >
                    <span className='text-sm font-semibold text-neutral-400 row-span-2 md:row-span-1 flex items-start md:items-center'>
                        {step.number}
                    </span>

                    <span className='text-base sm:text-lg font-semibold text-ui-background-primary leading-snug flex items-center'>
                        {step.title}
                    </span>

                    <p className='col-start-2 md:col-start-3 text-sm sm:text-base text-neutral-500 leading-relaxed flex items-center'>
                        {step.description}
                    </p>
                </div>
            ))}
        </div>
    );
};
