import type { ReactNode } from 'react';

import type { PolicyDocument as PolicyDocumentContent } from '../../../../content/types.ts';

export interface PolicyDocumentProps {
    document: PolicyDocumentContent;
    /** Where the page sits, e.g. IJJI Tracker / Privacy policy. */
    breadcrumb?: { label: string; to: string }[];
    /** Something to show at the end of a section, by section id (the deletion form). */
    after?: Record<string, ReactNode>;
    /** Shown after the last section. */
    children?: ReactNode;
}
