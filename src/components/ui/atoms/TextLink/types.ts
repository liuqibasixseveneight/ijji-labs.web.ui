import type { ReactNode } from 'react';

export interface TextLinkProps {
    to: string;
    children: ReactNode;
    underline?: 'hover' | 'always';
    className?: string;
}
