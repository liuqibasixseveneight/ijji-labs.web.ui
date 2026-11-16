import type { ReactNode } from 'react';

export interface RollingTextProps {
    /** Plain text: it's shown twice (once for the roll). */
    children: ReactNode;
    className?: string;
    /** Classes for the copy that rolls in only, e.g. its colour. */
    rollInClassName?: string;
}
