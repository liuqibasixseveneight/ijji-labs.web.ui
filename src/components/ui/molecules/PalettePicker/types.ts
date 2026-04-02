import { palettes } from '../../organisms/FluidGradient/utils';

export type PaletteKey = keyof typeof palettes;

export interface PalettePickerProps {
    activeKey: PaletteKey;
    onChange: (key: PaletteKey) => void;
}
