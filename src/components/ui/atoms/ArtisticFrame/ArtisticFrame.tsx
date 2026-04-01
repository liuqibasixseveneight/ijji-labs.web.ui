import type { ArtisticFrameProps } from './types.ts';

export const ArtisticFrame = ({ children, className = '', cutSize = 32 }: ArtisticFrameProps) => {
    const clipPath = `polygon(
        0 0,
        calc(100% - ${cutSize}px) 0,
        100% ${cutSize}px,
        100% 100%,
        0 100%
    )`;

    return (
        <div className={`rounded-l-4xl overflow-hidden ${className}`} style={{ clipPath }}>
            {children}
        </div>
    );
};
