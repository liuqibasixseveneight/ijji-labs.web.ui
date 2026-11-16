import type { Palette } from '../../ui';

export interface HomeContextProps {
    isGradientDark: boolean;
    handlePaletteChange: (palette: Palette) => void;
}
