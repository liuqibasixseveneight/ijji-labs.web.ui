interface NavMenuItemProps {
    label: string;
    to: string;
    num: string;
    description: string;
}

export interface NavMenuProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    links: NavMenuItemProps[];
}
