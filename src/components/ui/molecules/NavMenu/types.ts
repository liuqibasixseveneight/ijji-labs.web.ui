import type { ReactNode } from 'react';

import type { NavMenuItemLink } from '../../atoms';

export interface NavMenuProps {
    id?: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    links: NavMenuItemLink[];
    /** The menu's name for screen readers: "Main" on the site. */
    label?: string;
    /** What sits under the list: the studio's email and location on the site. */
    footer?: ReactNode;
}
