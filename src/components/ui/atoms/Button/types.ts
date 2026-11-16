import type { ButtonHTMLAttributes } from 'react';
import type { LinkProps } from 'react-router-dom';

type BaseProps = {
    cutSize?: number;
    label: string;
    isLoading?: boolean;
    className?: string;
    /** `compact` on phones, full size from tablets up (the navbar). @default 'full' */
    size?: 'full' | 'compact';
};

type ButtonVariant = BaseProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        type?: 'button' | 'submit' | 'reset';
    };

type LinkVariant = BaseProps &
    Omit<LinkProps, 'to'> & {
        type: 'internal-link';
        to: string;
    };

export type ButtonProps = ButtonVariant | LinkVariant;
