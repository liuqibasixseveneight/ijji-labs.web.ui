import type { ReactNode } from 'react';

import type { ResponsiveImageSource } from '../../../../assets/images';
import type { BadgeLinkProps } from '../../atoms';

export interface PageHeroProps {
    /** The page's h1. */
    title: ReactNode;
    /** One or two short paragraphs under the title. */
    lede: ReactNode[];
    /** Jump links to the page's sections. */
    links?: BadgeLinkProps[];
    /** The page's main image; it loads first. */
    image?: { source: ResponsiveImageSource; alt: string };
    /** Anything else between the links and the image, e.g. store badges. */
    children?: ReactNode;
}
