import type { ReactNode } from 'react';

export interface AccordionItemProps {
    question: string;
    answer: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}
