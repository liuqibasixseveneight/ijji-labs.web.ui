import { palettes } from '../../organisms/FluidGradient/utils';
import type { PaletteKey } from './types.ts';

const keys = Object.keys(palettes) as PaletteKey[];

export const lightKeys = keys.slice(0, 3);
export const darkKeys = keys.slice(3);
