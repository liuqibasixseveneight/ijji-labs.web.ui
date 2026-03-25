export interface NavbarItem {
    text: string;
    to: string;
}

export interface NavbarProps {
    items?: NavbarItem[];
}
