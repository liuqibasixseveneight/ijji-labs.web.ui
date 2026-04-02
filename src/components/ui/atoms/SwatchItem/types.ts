import type { RefObject } from 'react';

import type { TooltipProps } from '../Tooltip';

export interface SwatchItemProps {
    paletteKey: string;
    name: string;
    color4: string;
    color6: string;
    color8: string;
    isActive: boolean;
    side: 'light' | 'dark';
    wrapperRef: RefObject<HTMLDivElement | null>;
    onChange: (key: string) => void;
    onHover: (state: TooltipProps | null) => void;
}
