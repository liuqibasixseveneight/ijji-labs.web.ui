import type { Palette } from '../../../../ui';

export interface HomeHeroProps {
    isGradientDark: boolean;
    handlePaletteChange: (palette: Palette) => void;
}
