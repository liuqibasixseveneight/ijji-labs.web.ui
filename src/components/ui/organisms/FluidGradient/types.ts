import { type Palette } from './utils';
import type { PaletteKey } from '../../molecules';

export interface FluidGradientProps {
    palette?: PaletteKey | Palette;
    showPalettePicker?: boolean;
    onPaletteChange?: (palette: Palette) => void;
}
