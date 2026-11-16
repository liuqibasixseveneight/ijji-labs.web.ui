import type { Palette } from '../../../../ui/organisms/FluidGradient/utils';

export interface HomeHeroProps {
    isGradientDark: boolean;
    handlePaletteChange: (palette: Palette) => void;
}
