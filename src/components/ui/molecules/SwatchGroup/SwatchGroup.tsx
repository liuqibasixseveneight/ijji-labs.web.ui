import { palettes } from '../../organisms/FluidGradient/utils';

import type { SwatchGroupProps } from './types.ts';
import { SwatchItem } from '../../atoms';

export const SwatchGroup = ({
    keys,
    activeKey,
    side,
    wrapperRef,
    onChange,
    onHover,
}: SwatchGroupProps) => (
    <div
        className='flex items-center gap-1.5 px-3 py-2'
        style={{
            background: side === 'light' ? 'rgba(255, 255, 255, 0.82)' : 'rgba(12, 12, 18, 0.82)',
            backdropFilter: 'blur(8px)',
        }}
    >
        {keys.map((key) => {
            const p = palettes[key];
            return (
                <SwatchItem
                    key={key}
                    paletteKey={key}
                    name={p.name}
                    color4={p.color4}
                    color6={p.color6}
                    color8={p.color8}
                    isActive={key === activeKey}
                    side={side}
                    wrapperRef={wrapperRef}
                    onChange={onChange}
                    onHover={onHover}
                />
            );
        })}
    </div>
);
