import type { ButtonProps } from './types.ts';

export const Button = ({
    label,
    cutSize = 14,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const clipPath = `polygon(
        0 0,
        calc(100% - ${cutSize}px) 0,
        100% ${cutSize}px,
        100% 100%,
        0 100%
    )`;

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`
                relative bg-brand-primary text-ui-background-primary
                text-sm font-extrabold tracking-widest uppercase
                px-10 py-4 rounded-l-4xl
                hover:opacity-90 active:opacity-75
                transition-opacity
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
                ${className}
            `}
            style={{ clipPath }}
        >
            {isLoading ? 'Sending...' : label}
        </button>
    );
};
