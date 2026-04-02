import { type RefObject, useState, useRef } from 'react';

import type { PaletteKey, PalettePickerProps } from './types.ts';
import { palettes } from '../../organisms/FluidGradient/utils';
import { ArtisticFrame } from '../../atoms';

const lightKeys = (Object.keys(palettes) as PaletteKey[]).slice(0, 3);
const darkKeys = (Object.keys(palettes) as PaletteKey[]).slice(3);

type TooltipState = { name: string; x: number } | null;

const SwatchGroup = ({
    keys,
    activeKey,
    onChange,
    side,
    wrapperRef,
    onHover,
}: {
    keys: PaletteKey[];
    activeKey: PaletteKey;
    onChange: (key: PaletteKey) => void;
    side: 'light' | 'dark';
    wrapperRef: RefObject<HTMLDivElement | null>;
    onHover: (state: TooltipState) => void;
}) => (
    <div
        className='flex items-center gap-1.5 px-3 py-2'
        style={{
            background: side === 'light' ? 'rgba(255, 255, 255, 0.82)' : 'rgba(12, 12, 18, 0.82)',
            backdropFilter: 'blur(8px)',
        }}
    >
        {keys.map((key) => {
            const p = palettes[key];
            const isActive = key === activeKey;
            return (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    onMouseEnter={(e) => {
                        const wrapper = wrapperRef.current;
                        if (!wrapper) return;
                        const btnRect = (
                            e.currentTarget as HTMLButtonElement
                        ).getBoundingClientRect();
                        const wrapperRect = wrapper.getBoundingClientRect();
                        onHover({
                            name: p.name,
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
                        background: `linear-gradient(135deg, ${p.color4} 0%, ${p.color6} 50%, ${p.color8} 100%)`,
                    }}
                />
            );
        })}
    </div>
);

export const PalettePicker = ({ activeKey, onChange }: PalettePickerProps) => {
    const [tooltip, setTooltip] = useState<TooltipState>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={wrapperRef} className='relative'>
            {tooltip && (
                <div
                    className='absolute bottom-full mb-2 -translate-x-1/2 px-4 py-2 rounded text-xs font-extrabold whitespace-nowrap pointer-events-none bg-black/75 text-white uppercase'
                    style={{ left: tooltip.x }}
                >
                    {tooltip.name}
                </div>
            )}

            <ArtisticFrame cutSize={12} className='bg-black/10 p-px'>
                <ArtisticFrame cutSize={11} className='flex'>
                    <SwatchGroup
                        keys={lightKeys}
                        activeKey={activeKey}
                        onChange={onChange}
                        side='light'
                        wrapperRef={wrapperRef}
                        onHover={setTooltip}
                    />
                    <div
                        className='w-px self-stretch'
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                    />
                    <SwatchGroup
                        keys={darkKeys}
                        activeKey={activeKey}
                        onChange={onChange}
                        side='dark'
                        wrapperRef={wrapperRef}
                        onHover={setTooltip}
                    />
                </ArtisticFrame>
            </ArtisticFrame>
        </div>
    );
};
