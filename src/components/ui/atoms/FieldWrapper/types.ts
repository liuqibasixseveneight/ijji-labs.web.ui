import type { ReactNode } from 'react';

export interface FieldWrapperProps {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}
