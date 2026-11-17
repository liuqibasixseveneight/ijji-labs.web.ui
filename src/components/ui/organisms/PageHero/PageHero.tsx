import { ArtisticFrame, ResponsiveImage, Section } from '../../atoms';
import { BadgeLinks } from '../../molecules';
import type { PageHeroProps } from './types.ts';

/** The top of every page but Home: a big title, a line or two, jump links and an image. */
export const PageHero = ({ title, lede, links, image, children }: PageHeroProps) => (
    <Section tone='dark' spacing='md'>
        <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6svh]'>
            {title}
        </h1>

        {lede.map((paragraph, index) => (
            <p
                key={index}
                className={`text-xl text-white/60 max-w-xl ${index === lede.length - 1 ? 'mb-10' : 'mb-4'}`}
            >
                {paragraph}
            </p>
        ))}

        {links && (
            <nav aria-label='On this page' className='mb-12'>
                <BadgeLinks links={links} />
            </nav>
        )}

        {children}

        {image && (
            <ArtisticFrame className='w-full'>
                <ResponsiveImage
                    image={image.source}
                    alt={image.alt}
                    priority
                    className='block w-full h-auto max-h-[65vh] object-cover'
                />
            </ArtisticFrame>
        )}
    </Section>
);
