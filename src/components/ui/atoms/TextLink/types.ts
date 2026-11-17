import type { ReactNode } from 'react';

export interface TextLinkProps {
    to: string;
    children: ReactNode;
    /** The section it sits on. @default 'dark' */
    tone?: 'dark' | 'light';
    className?: string;
}
