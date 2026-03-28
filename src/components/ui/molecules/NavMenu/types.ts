export interface NavMenuProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    links?: {
        label: string;
        to: string;
    }[];
}
