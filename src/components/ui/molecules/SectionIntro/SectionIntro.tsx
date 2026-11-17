import { clsx } from 'clsx';

import type { SectionIntroProps } from './types.ts';

const TITLE_SIZES = {
    /** The big band headings: Our services, Our work. */
    display: 'text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-none mb-10',
    /** Headings within running text: Our story, Why independent? */
    heading: 'text-3xl md:text-4xl font-medium mb-10',
} as const;

/** A section's heading and the line under it, coloured for a dark or white band. */
export const SectionIntro = ({
    title,
    lede,
    tone = 'dark',
    size = 'display',
    level = 2,
    id,
    align = 'start',
}: SectionIntroProps) => {
    const Heading = `h${level}` as const;

    return (
        <div className={clsx('flex flex-col', align === 'center' && 'items-center text-center')}>
            <Heading
                id={id}
                className={clsx(
                    TITLE_SIZES[size],
                    tone === 'dark' ? 'text-white' : 'text-ui-background-primary',
                )}
            >
                {title}
            </Heading>

            {lede && (
                <p
                    className={clsx(
                        'text-lg sm:text-xl max-w-2xl leading-relaxed mb-16',
                        tone === 'dark' ? 'text-neutral-400' : 'text-neutral-600',
                    )}
                >
                    {lede}
                </p>
            )}
        </div>
    );
};
