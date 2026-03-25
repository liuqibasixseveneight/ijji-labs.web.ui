import type { ButtonProps } from './types.ts';

const baseClasses =
    'uppercase font-semibold px-6 py-2 transition-all duration-300 active:scale-[0.98] cursor-pointer text-ui-background bg-brand-primary brightness-80';
const hoverClasses = 'hover:brightness-100';

export const Button = ({ text, onClick }: ButtonProps) => {
    return (
        <button onClick={onClick} className={[baseClasses, hoverClasses].join(' ')}>
            {text}
        </button>
    );
};
