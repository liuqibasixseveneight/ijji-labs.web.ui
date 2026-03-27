import type { HamburgerIconProps } from './types.ts';

export const HamburgerIcon = ({ isOpen, setIsOpen }: HamburgerIconProps) => {
    return (
        <button
            onClick={setIsOpen}
            className='relative w-10 h-10 flex items-center justify-center cursor-pointer'
            aria-label='Toggle menu'
        >
            <span
                className={`absolute h-0.5 w-6 bg-ui-background-secondary transition-all duration-300 ease-in-out ${
                    isOpen ? 'rotate-45' : '-translate-y-1.5'
                }`}
            />
            <span
                className={`absolute h-0.5 w-6 bg-ui-background-secondary transition-all duration-300 ease-in-out ${
                    isOpen ? '-rotate-45' : 'translate-y-1.5'
                }`}
            />
        </button>
    );
};
