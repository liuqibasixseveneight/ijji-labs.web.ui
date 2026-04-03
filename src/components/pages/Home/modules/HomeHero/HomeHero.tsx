import { FluidGradient } from '../../../../ui';
import type { HomeHeroProps } from './types.ts';

export const HomeHero = ({ isGradientDark, handlePaletteChange }: HomeHeroProps) => {
    return (
        <div className='flex-1 h-full relative flex flex-col items-center justify-center w-full overflow-hidden min-h-dvh'>
            <FluidGradient showPalettePicker onPaletteChange={handlePaletteChange} />

            <div
                className={`font-newsreader font-extrabold text-[clamp(20vw,50vw,50rem)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none ${isGradientDark ? 'text-white/5' : 'text-ui-background-secondary/5'}`}
                aria-hidden={'true'}
            >
                ijji
            </div>

            <div className='z-2 text-center px-6 md:px-8 relative max-w-360'>
                <h1
                    className={`font-extrabold leading-tight text-[clamp(2.5rem,8vw,6rem)] max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] ${isGradientDark ? 'text-white' : 'text-ui-background-secondary'}`}
                >
                    Designing websites that convert
                </h1>
                <p
                    className={`mt-4 text-[clamp(1.25rem,4vw,2rem)] max-w-[90vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto ${isGradientDark ? 'text-white' : 'text-ui-background-secondary'}`}
                >
                    Beautiful, user-friendly digital experiences for your business
                </p>
            </div>
        </div>
    );
};
