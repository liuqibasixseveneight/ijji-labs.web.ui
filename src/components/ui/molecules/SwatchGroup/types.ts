import type { RefObject } from 'react';

import type { TooltipProps } from '../../atoms';

export interface SwatchGroupProps {
    keys: string[];
    activeKey: string;
    side: 'light' | 'dark';
    wrapperRef: RefObject<HTMLDivElement | null>;
    onChange: (key: string) => void;
    onHover: (state: TooltipProps | null) => void;
}
