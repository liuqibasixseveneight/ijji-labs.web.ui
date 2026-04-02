const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

export const config = {
    brushSize: isMobile ? 90.0 : 45.0,
    brushStrength: isMobile ? 6.5 : 4.5,
    distortionAmount: isMobile ? 4.2 : 3.2,
    fluidDecay: 0.97,
    trailLength: 0.92,
    stopDecay: 0.92,
    // Light
    // color1: '#0f0f14',
    // color2: '#1b1b2b',
    // color3: '#2a2a40',
    // color4: '#5b4d8a',
    // color5: '#8a6fd1',
    // color6: '#5ea8c7',
    // color7: '#c8b6ff',
    // color8: '#f4f0ff',
    // ANOTHER
    // color1: '#0c0f16',
    // color2: '#181d29',
    // color3: '#2a3142',
    // color4: '#FAEE47',
    // color5: '#ff6b81',
    // color6: '#67e8f9',
    // color7: '#c4b5fd',
    // color8: '#f9f9ff',
    // ANOTHEREEE
    // color1: '#090c14',
    // color2: '#141a26',
    // color3: '#20293a',
    // color4: '#FAEE47',
    // color5: '#f97316',
    // color6: '#38bdf8',
    // color7: '#818cf8',
    // color8: '#f5f7ff',
    // HERE
    // color1: '#fff8f1',
    // color2: '#f2d7c4',
    // color3: '#c79b84',
    // color4: '#FAEE47',
    // color5: '#ff7b54',
    // color6: '#5dd39e',
    // color7: '#2f3a4d',
    // color8: '#10141b',
    // AND
    // color1: '#faf8f2',
    // color2: '#ddd4c5',
    // color3: '#aa9f91',
    // color4: '#FAEE47',
    // color5: '#ff9966',
    // color6: '#7bdff2',
    // color7: '#31405a',
    // color8: '#11151d',
    // AAAAAAND
    // 8 - FAVOURITE
    // color1: '#fffffb', // Pure ivory
    // color2: '#fdfbf7', // Pale warm silk
    // color3: '#f6f2e9', // Soft oat
    // color4: '#ede7db', // Pale sandstone
    // color5: '#e6decb', // Deeper oat
    // color6: '#dcd3be', // Warmest valley shadow
    // color7: '#ebe3d1', // Bridge color
    // color8: '#ffffff', // Pure white peaks
    // 9 - FAVOURITE
    // color1: '#f0efeb', // Warm silk base
    // color2: '#e4e5e6', // Cool silver/slate
    // color3: '#eceae4', // Soft champagne
    // color4: '#f6f5f2', // Warm off-white
    // color5: '#dcdde0', // Cool shadow ripple
    // color6: '#e8e4dc', // Warm mid ripple
    // color7: '#f9f8f6', // Bright bridge
    // color8: '#ffffff', // Pure white wave peaks
    // 10 - PEARL
    color1: '#fff5f7',
    color2: '#ffe4e9',
    color3: '#ffc9d9',
    color4: '#ffa8c5',
    color5: '#c9b7eb',
    color6: '#b8e6f0',
    color7: '#e8f9fd',
    color8: '#ffffff',
    //
    // color1: '#2a1b1f', // darker version of soft pink
    // color2: '#3d252d', // darker rose
    // color3: '#5c3a46', // muted deep pink
    // color4: '#7a4f61', // dusty pink
    // color5: '#4b3a5c', // muted purple
    // color6: '#39707c', // muted teal/cyan
    // color7: '#1b3b46', // deep aqua
    // color8: '#121212', // pure dark background
    colorIntensity: 1.0,
    softness: isMobile ? 0.3 : 0.4,
};
