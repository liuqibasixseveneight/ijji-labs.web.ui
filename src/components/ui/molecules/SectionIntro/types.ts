import type { ReactNode } from 'react';

import type { SectionTone } from '../../atoms';

export interface SectionIntroProps {
    title: ReactNode;
    lede?: ReactNode;
    /** Match the section it sits in. @default 'dark' */
    tone?: SectionTone;
    /** @default 'display' */
    size?: 'display' | 'heading';
    /** @default 2 */
    level?: 2 | 3;
    /** The heading's id, for a section's `labelledBy`. */
    id?: string;
    /** @default 'start' */
    align?: 'start' | 'center';
}
