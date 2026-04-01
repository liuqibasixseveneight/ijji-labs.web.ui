import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cutSize?: number;
    label: string;
    isLoading?: boolean;
}
