export interface NavMenuItemLink {
    label: string;
    to: string;
    num: string;
    description: string;
}

export interface NavMenuItemProps {
    link: NavMenuItemLink;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    setIsOpen: (open: boolean) => void;
}
