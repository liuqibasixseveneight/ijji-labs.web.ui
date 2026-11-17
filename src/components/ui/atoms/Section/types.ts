import type { ReactNode } from 'react';

export type SectionTone = 'dark' | 'light';

export interface SectionProps {
    /** Dark (`#121212`) or white. @default 'dark' */
    tone?: SectionTone;
    /** How wide the content runs. @default 'wide' */
    width?: 'wide' | 'grid' | 'media' | 'text';
    /** Space above and below. @default 'lg' */
    spacing?: 'sm' | 'md' | 'lg';
    /** For `#id` jump links. */
    id?: string;
    /** The id of the heading that names this section. */
    labelledBy?: string;
    className?: string;
    innerClassName?: string;
    children: ReactNode;
}
