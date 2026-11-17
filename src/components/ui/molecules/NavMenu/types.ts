import type { NavMenuItemLink } from '../../atoms';

export interface NavMenuProps {
    id?: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    links: NavMenuItemLink[];
}
