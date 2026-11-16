import type { SwatchItemProps } from './types.ts';

export const SwatchItem = ({
    paletteKey,
    name,
    color4,
    color6,
    color8,
    isActive,
    side,
    wrapperRef,
    onChange,
    onHover,
}: SwatchItemProps) => (
    <button
        onClick={() => onChange(paletteKey)}
        onMouseEnter={(e) => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;
            const btnRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            onHover({
                label: name,
                x: btnRect.left - wrapperRect.left + btnRect.width / 2,
            });
        }}
        onMouseLeave={() => onHover(null)}
        className={`w-5 h-5 cursor-pointer rounded-full border-2 transition-transform duration-200 ${
            isActive
                ? side === 'light'
                    ? 'border-black/50 scale-115 shadow-[0_0_0_2px_white_inset]'
                    : 'border-white/60 scale-115 shadow-[0_0_0_2px_rgba(0,0,0,0.6)_inset]'
                : 'border-transparent'
        }`}
        style={{
            background: `linear-gradient(135deg, ${color4} 0%, ${color6} 50%, ${color8} 100%)`,
        }}
    />
);
