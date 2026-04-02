const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

export type Palette = {
    name: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    color6: string;
    color7: string;
    color8: string;
    isDark: boolean;
};

export const palettes: Record<string, Palette> = {
    silk: {
        name: 'Silk',
        color1: '#1a1a1a',
        color2: '#2b2b2b',
        color3: '#3c3c3c',
        color4: '#505050',
        color5: '#6b6b6b',
        color6: '#888888',
        color7: '#b0b0b0',
        color8: '#e0e0e0',
        isDark: false,
    },
    pearl: {
        name: 'Pearl',
        color1: '#fff5f7',
        color2: '#ffe4e9',
        color3: '#ffc9d9',
        color4: '#ffa8c5',
        color5: '#c9b7eb',
        color6: '#b8e6f0',
        color7: '#e8f9fd',
        color8: '#ffffff',
        isDark: false,
    },
    solar: {
        name: 'Solar',
        color1: '#090c14',
        color2: '#141a26',
        color3: '#20293a',
        color4: '#FAEE47',
        color5: '#f97316',
        color6: '#38bdf8',
        color7: '#818cf8',
        color8: '#f5f7ff',
        isDark: false,
    },
    dusk: {
        name: 'Dusk',
        color1: '#fff8f1',
        color2: '#f2d7c4',
        color3: '#c79b84',
        color4: '#FAEE47',
        color5: '#ff7b54',
        color6: '#5dd39e',
        color7: '#2f3a4d',
        color8: '#10141b',
        isDark: true,
    },
    steel: {
        name: 'Steel',
        color1: '#f5f5f5',
        color2: '#d1cfcf',
        color3: '#9ab1c9',
        color4: '#6c5f8c',
        color5: '#43506d',
        color6: '#2e303b',
        color7: '#1a1c23',
        color8: '#0f1115',
        isDark: true,
    },
    arrakis: {
        name: 'Arrakis',
        color1: '#fff3e0',
        color2: '#ffe0b2',
        color3: '#ffd28c',
        color4: '#ffb75e',
        color5: '#e68a3e',
        color6: '#b66a2e',
        color7: '#7f4820',
        color8: '#4b2a10',
        isDark: true,
    },
};

export const defaultPaletteKey = 'silk';

export const config = {
    brushSize: isMobile ? 90.0 : 45.0,
    brushStrength: isMobile ? 6.5 : 4.5,
    distortionAmount: isMobile ? 4.2 : 3.2,
    fluidDecay: 0.97,
    trailLength: 0.92,
    stopDecay: 0.92,
    colorIntensity: 1.0,
    softness: isMobile ? 0.3 : 0.4,
};
