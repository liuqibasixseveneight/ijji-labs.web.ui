import type { Ref } from 'react';

export interface HamburgerIconProps {
    ref?: Ref<HTMLButtonElement>;
    isOpen: boolean;
    /** Toggles the menu. */
    setIsOpen: () => void;
    isWhite?: boolean;
    /** The id of the menu it opens. */
    controls?: string;
}
