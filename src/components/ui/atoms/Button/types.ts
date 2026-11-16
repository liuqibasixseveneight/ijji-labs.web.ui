import type { ButtonHTMLAttributes } from 'react';
import type { LinkProps } from 'react-router-dom';

type BaseProps = {
    cutSize?: number;
    label: string;
    isLoading?: boolean;
    className?: string;
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
