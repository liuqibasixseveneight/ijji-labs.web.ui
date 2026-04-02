import type { Palette } from '../../ui/organisms/FluidGradient/utils';

export interface HomeContextProps {
    isGradientDark: boolean;
    handlePaletteChange: (palette: Palette) => void;
}
