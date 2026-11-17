import type { AppEntry } from '../../../../content/types.ts';

export interface AppCardProps {
    app: AppEntry;
    /** Match the page's outline. @default 3 */
    headingLevel?: 2 | 3;
}
