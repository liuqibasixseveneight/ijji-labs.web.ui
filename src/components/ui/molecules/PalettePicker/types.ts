import type { palettes } from '../../organisms/FluidGradient/utils';

export type PaletteKey = keyof typeof palettes;

export type PalettePickerProps = {
    activeKey: PaletteKey;
    onChange: (key: PaletteKey) => void;
};
