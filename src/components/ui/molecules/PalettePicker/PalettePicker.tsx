import { useState, useRef } from 'react';

import { ArtisticFrame, Tooltip, type TooltipProps } from '../../atoms';
import { SwatchGroup } from '../SwatchGroup';

import { lightKeys, darkKeys } from './utils.ts';
import type { PalettePickerProps } from './types.ts';

export const PalettePicker = ({ activeKey, onChange }: PalettePickerProps) => {
    const [tooltip, setTooltip] = useState<TooltipProps | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={wrapperRef} className='relative'>
            {tooltip && <Tooltip label={tooltip.label} x={tooltip.x} />}

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
