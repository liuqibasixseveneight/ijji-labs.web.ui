import type { ReactNode } from 'react';

export interface AccordionEntry {
    question: string;
    answer: ReactNode;
}

export interface AccordionProps {
    items: AccordionEntry[];
}
