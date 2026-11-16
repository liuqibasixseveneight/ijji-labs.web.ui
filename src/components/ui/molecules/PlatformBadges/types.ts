import type { AppEntry } from '../../../../content/types.ts';
import type { SectionTone } from '../../atoms';

export interface PlatformBadgesProps {
    platforms: AppEntry['platforms'];
    /** @default 'dark' */
    tone?: SectionTone;
}
