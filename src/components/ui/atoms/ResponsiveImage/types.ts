import type { ResponsiveImageSource } from '../../../../assets/images';

export interface ResponsiveImageProps {
    image: ResponsiveImageSource;
    alt: string;
    /** How wide it shows, for choosing a file. @default '(min-width: 1520px) 1440px, 100vw' */
    sizes?: string;
    /** The page's main image: load it first, not lazily. @default false */
    priority?: boolean;
    className?: string;
}
