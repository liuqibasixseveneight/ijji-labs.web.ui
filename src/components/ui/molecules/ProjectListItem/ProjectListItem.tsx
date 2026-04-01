import type { ProjectListItemProps } from './types.ts';

export const ProjectListItem = ({
    img,
    title,
    description,
    imagePosition = 'left',
}: ProjectListItemProps) => {
    const isRight = imagePosition === 'right';

    return (
        <div
            className={`flex flex-col lg:flex-row items-center gap-20 ${
                isRight ? 'lg:flex-row-reverse' : ''
            }`}
        >
            <img
                src={img?.src}
                alt={img?.alt}
                className={'object-cover w-full min-h-120 h-full rounded-4xl flex-1'}
            />

            <div className={`flex-1 ${isRight ? 'text-right' : 'text-left'}`}>
                <div className={'font-newsreader text-6xl mb-6'}>{title}</div>

                <div className='text-base leading-relaxed sm:text-lg lg:text-xl text-ui-text-secondary mb-12'>
                    {description}
                </div>

                <div className={'uppercase text-brand-primary'}>Find out more</div>
            </div>
        </div>
    );
};
