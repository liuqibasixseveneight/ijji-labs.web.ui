import { paths } from '../../../../router/paths.ts';
import { AppMark, ArtisticFrame, Button } from '../../atoms';
import { PlatformBadges } from '../../molecules';
import type { AppCardProps } from './types.ts';

/** One of our apps, as a card on Home and /apps, linking to its page. */
export const AppCard = ({ app, headingLevel = 3 }: AppCardProps) => {
    const Heading = `h${headingLevel}` as const;

    return (
        <article className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center'>
            <ArtisticFrame
                cutSize={32}
                className='aspect-4/3 bg-neutral-900 flex items-center justify-center'
            >
                <div className='flex flex-col items-center gap-6 px-8 text-center'>
                    <AppMark slug={app.slug} size='lg' />
                    <p className='text-neutral-400 text-sm tracking-widest uppercase font-semibold'>
                        {app.tagline}
                    </p>
                </div>
            </ArtisticFrame>

            <div className='flex flex-col gap-4'>
                <p className='text-sm sm:text-base text-neutral-400 uppercase font-semibold'>
                    Our app
                </p>
                <Heading className='text-4xl sm:text-5xl font-extrabold text-white leading-none'>
                    {app.name}
                </Heading>
                <p className='text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md'>
                    {app.summary}
                </p>

                <div className='mt-2'>
                    <PlatformBadges platforms={app.platforms} />
                </div>

                <Button
                    type='internal-link'
                    to={paths.app(app.slug).root}
                    label={`See ${app.name}`}
                    className='self-start mt-6'
                />
            </div>
        </article>
    );
};
