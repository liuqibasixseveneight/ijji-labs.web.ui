import type { ReactNode } from 'react';

import type { SectionTone } from '../../atoms';

export interface TextSectionProps {
    /** For `#id` jump links; the heading gets `<id>-title`. */
    id?: string;
    title: string;
    paragraphs: readonly string[];
    /** @default 'light' */
    tone?: SectionTone;
    /** After the paragraphs, e.g. a MoreLink. */
    children?: ReactNode;
}
