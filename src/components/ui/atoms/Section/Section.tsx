import { clsx } from 'clsx';

import type { SectionProps } from './types.ts';

const TONES = {
    dark: 'bg-ui-background-primary',
    light: 'bg-white',
} as const;

const WIDTHS = {
    /** Full content width, for heroes, grids and lists. */
    wide: 'max-w-380',
    /** Cards in a row. */
    grid: 'max-w-7xl',
    /** A large image. */
    media: 'max-w-300',
    /** Running text, at a comfortable line length. */
    text: 'max-w-260',
} as const;

const SPACING = {
    sm: 'py-[6vh]',
    md: 'py-[8vh]',
    lg: 'py-[10vh]',
} as const;

/**
 * One band of a page: the dark or white background running edge to edge, with the content
 * centred inside at one of the site's widths. Every page section is built from this.
 */
export const Section = ({
    tone = 'dark',
    width = 'wide',
    spacing = 'lg',
    id,
    className,
    innerClassName,
    labelledBy,
    children,
}: SectionProps) => (
    <section
        id={id}
        aria-labelledby={labelledBy}
        className={clsx('flex flex-col items-center w-full', TONES[tone], className)}
    >
        <div
            className={clsx(
                'w-full flex-1 flex flex-col px-6 md:px-8',
                WIDTHS[width],
                SPACING[spacing],
                innerClassName,
            )}
        >
            {children}
        </div>
    </section>
);
