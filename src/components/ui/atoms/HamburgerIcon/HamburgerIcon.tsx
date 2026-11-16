import { clsx } from 'clsx';

import type { HamburgerIconProps } from './types.ts';

const barClasses = 'absolute h-1 w-6 transition-all duration-300 ease-in-out';

export const HamburgerIcon = ({ isOpen, setIsOpen, isWhite, controls }: HamburgerIconProps) => {
    const colour = isOpen || isWhite ? 'bg-white' : 'bg-ui-background-secondary';

    return (
        <button
            type='button'
            onClick={setIsOpen}
            className='relative w-10 h-10 flex items-center justify-center cursor-pointer'
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls={controls}
        >
            <span
                className={clsx(barClasses, colour, isOpen ? 'h-2 rotate-45' : '-translate-y-1.5')}
            />
            <span
                className={clsx(barClasses, colour, isOpen ? 'h-2 -rotate-45' : 'translate-y-1.5')}
            />
        </button>
    );
};
