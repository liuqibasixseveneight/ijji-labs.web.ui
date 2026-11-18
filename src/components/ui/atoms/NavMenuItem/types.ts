export interface NavMenuItemLink {
    label: string;
    to: string;
    num: string;
    description: string;
    /** False keeps the row current on the pages beneath it too (/deletion-requests/:id). */
    end?: boolean;
}

export interface NavMenuItemProps {
    link: NavMenuItemLink;
    /** Its place in the menu, for the staggered entrance. */
    index: number;
    /** Whether the menu is open: the rows slide in one after another as it opens. */
    isMenuOpen: boolean;
    onHover: () => void;
    onLeave: () => void;
    setIsOpen: (open: boolean) => void;
}
