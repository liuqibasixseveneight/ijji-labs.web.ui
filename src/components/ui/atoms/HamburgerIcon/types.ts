export interface HamburgerIconProps {
    isOpen: boolean;
    /** Toggles the menu. */
    setIsOpen: () => void;
    isWhite?: boolean;
    /** The id of the menu it opens. */
    controls?: string;
}
