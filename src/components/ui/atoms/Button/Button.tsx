import type { ButtonProps } from './types.ts';
import { clsx } from 'clsx';

const baseClasses =
    'rounded-full uppercase font-semibold px-6 py-2 transition-all duration-300 cursor-pointer text-brand-primary bg-transparent border border-brand-primary';
const hoverClasses = 'hover:bg-brand-primary hover:text-white';

export const Button = ({ text, onClick }: ButtonProps) => {
    return (
        <button onClick={onClick} className={clsx(baseClasses, hoverClasses)}>
            {text}
        </button>
    );
};
