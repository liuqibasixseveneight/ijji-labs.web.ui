import type { SectionTone } from '../../atoms';

export interface CtaBandProps {
    title: string;
    lede: string;
    action: { label: string; to: string };
    /** @default 'dark' */
    tone?: SectionTone;
}
