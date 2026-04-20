import { Link } from 'react-router-dom';

import type { ButtonProps } from './types.ts';

export const Button = (props: ButtonProps) => {
    const { label, cutSize = 14, isLoading = false, className = '' } = props;

    const clipPath = `polygon(
        0 0,
        calc(100% - ${cutSize}px) 0,
        100% ${cutSize}px,
        100% 100%,
        0 100%
    )`;

    const baseClasses = `
        relative bg-brand-primary text-ui-background-primary
        text-sm font-extrabold tracking-widest uppercase
        px-10 py-4 rounded-l-4xl flex items-center justify-center gap-3
        hover:opacity-90 active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
    `;

    const content = (
        <>
            {isLoading && (
                <svg
                    className='animate-spin h-5 w-5 text-ui-background-primary'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                >
                    <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                    />
                    <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                </svg>
            )}
            <span>{isLoading ? 'Sending...' : label}</span>
        </>
    );

    // 👉 Internal link variant
    if (props.type === 'internal-link') {
        const { to, ...rest } = props;

        return (
            <Link to={to} {...rest} className={baseClasses} style={{ clipPath }}>
                {content}
            </Link>
        );
    }

    // 👉 Default button variant
    const { type = 'button', disabled, ...rest } = props;

    return (
        <button
            {...rest}
            type={type}
            disabled={disabled || isLoading}
            className={baseClasses}
            style={{ clipPath }}
        >
            {content}
        </button>
    );
};
