import type { ServiceCardProps } from './types.ts';

export const ServiceCard = ({ title, description, included, optional }: ServiceCardProps) => {
    return (
        <div className='flex flex-col gap-5 bg-ui-background-primary p-5 sm:p-6 lg:p-10 h-full'>
            <div className='flex items-start justify-between gap-3'>
                <h3 className='text-lg sm:text-xl font-semibold text-white leading-snug'>
                    {title}
                </h3>

                {optional && (
                    <span className='shrink-0 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-neutral-400 border border-neutral-700 px-2 py-1 rounded-full'>
                        Optional
                    </span>
                )}
            </div>

            <p className='text-sm sm:text-base text-neutral-400 leading-relaxed min-h-0 sm:min-h-28'>
                {description}
            </p>

            <ul className='flex flex-col gap-2 border-t border-neutral-800 pt-5 sm:pt-6 mt-auto'>
                {included.map((item, index: number) => (
                    <li
                        key={`${item}-${index}`}
                        className='flex items-center gap-3 text-sm text-neutral-400'
                    >
                        <span className='w-1 h-1 rounded-full bg-neutral-500 shrink-0' />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};
