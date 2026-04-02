import type { TooltipProps } from './types.ts';

const CUT = 8;
const clipPath = `polygon(
    0 0,
    calc(100% - ${CUT}px) 0,
    100% ${CUT}px,
    100% 100%,
    0 100%
)`;

export const Tooltip = ({ label, x }: TooltipProps) => (
    <div
        className='absolute bottom-full mb-2 -translate-x-1/2 px-4 py-2 rounded-l-xl text-xs font-extrabold whitespace-nowrap pointer-events-none bg-black/75 text-white uppercase'
        style={{ left: x, clipPath }}
    >
        {label}
    </div>
);
