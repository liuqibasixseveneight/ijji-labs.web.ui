import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { RollingText } from '../RollingText/RollingText.tsx';
import type { ButtonProps } from './types.ts';

const Spinner = () => (
    <svg
        className='animate-spin h-5 w-5 text-ui-background-primary'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        aria-hidden='true'
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
);

/**
 * The yellow, corner-cut call to action: a `<button>`, or a router link with
 * `type='internal-link'`. On hover or focus the label rolls up and the cut corner deepens.
 */
export const Button = (props: ButtonProps) => {
    const { label, cutSize = 14, isLoading = false, className, size = 'full' } = props;

    // The corner's size is a custom property, so hover can deepen it and clip-path animates.
    const style = {
        '--cut-rest': `${cutSize}px`,
        clipPath: 'polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%)',
    } as CSSProperties;

    const classes = clsx(
        'group relative bg-brand-primary text-ui-background-primary',
        'whitespace-nowrap font-extrabold tracking-widest uppercase rounded-l-4xl flex items-center justify-center gap-3',
        size === 'full' ? 'text-sm px-10 py-4' : 'text-xs px-5 py-3 md:text-sm md:px-10 md:py-4',
        '[--cut:var(--cut-rest)] hover:[--cut:calc(var(--cut-rest)*1.8)] focus-visible:[--cut:calc(var(--cut-rest)*1.8)]',
        '[transition:clip-path_500ms_cubic-bezier(0.22,1,0.36,1),scale_150ms_ease] active:scale-[0.97]',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:[--cut:var(--cut-rest)] cursor-pointer',
        className,
    );

    const content = isLoading ? (
        <>
            <Spinner />
            <span>Sending...</span>
        </>
    ) : (
        <RollingText>{label}</RollingText>
    );

    // Our own props are picked out of `rest` so they never land on the DOM element.
    if (props.type === 'internal-link') {
        const { to, type, ...rest } = omitOwnProps(props);

        return (
            <Link {...rest} to={to} className={classes} style={style}>
                {content}
            </Link>
        );
    }

    const { type = 'button', disabled, ...rest } = omitOwnProps(props);

    return (
        <button
            {...rest}
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={classes}
            style={style}
        >
            {content}
        </button>
    );
};

const omitOwnProps = <T extends ButtonProps>(props: T) => {
    const { label, cutSize, isLoading, className, size, ...rest } = props;
    return rest;
};
