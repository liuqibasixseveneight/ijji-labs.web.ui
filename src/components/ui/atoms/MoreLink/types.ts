import type { ReactNode } from 'react';

import type { SectionTone } from '../Section';

export interface MoreLinkProps {
    to: string;
    children: ReactNode;
    /** The band it sits on. @default 'dark' */
    tone?: SectionTone;
    className?: string;
}
