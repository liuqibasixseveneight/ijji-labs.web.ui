import { homeCopy } from '../../../../../content';
import { useScreenHeight } from '../../../../../lib/useScreenHeight.ts';
import { FluidGradient, ScrollIndicator } from '../../../../ui';
import type { HomeHeroProps } from './types.ts';

export const HomeHero = ({ isGradientDark, handlePaletteChange }: HomeHeroProps) => {
    const text = isGradientDark ? 'text-white' : 'text-ui-background-secondary';
    // Exactly the visible screen when the page opens, steady while scrolling (see the hook).
    const screenHeight = useScreenHeight();

    return (
        <div
            className='flex-1 h-full relative flex flex-col items-center w-full overflow-hidden min-h-svh'
            style={screenHeight ? { minHeight: screenHeight } : undefined}
        >
            <FluidGradient showPalettePicker onPaletteChange={handlePaletteChange} />

            <div
                className={`font-newsreader font-extrabold text-[60vw] md:text-[clamp(20vw,50vw,50rem)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none ${isGradientDark ? 'text-white/5' : 'text-ui-background-secondary/5'}`}
                aria-hidden='true'
            >
                ijji
            </div>

            {/* Room for the navbar above the text, and for "Scroll to explore" and the palette
            picker below it (both pinned to the bottom, so they take no space of their own).
            With room to spare the two spacers share it and the text sits in the middle; on a
            small screen they keep their minimums and the hero grows past the screen height,
            rather than the text running under the navbar or the indicator. */}
            <div
                aria-hidden='true'
                className='flex-1 w-full min-h-24 md:min-h-[calc(clamp(80px,10vh,100px)+16px)]'
            />

            <div className='z-2 text-center px-6 md:px-8 relative max-w-360'>
                <h1
                    className={`font-extrabold leading-tight text-5xl md:text-[clamp(2.5rem,8vw,8rem)] max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] ${text}`}
                >
                    {homeCopy.hero.title}
                </h1>
                <p
                    className={`mt-4 text-[clamp(1.25rem,4vw,2rem)] max-w-[90vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto ${text}`}
                >
                    {homeCopy.hero.lede}
                </p>
            </div>

            {/* Phones: the indicator sits 88px up and is about 62px tall, plus a gap. From md
            it sits 32px up. */}
            <div aria-hidden='true' className='flex-1 w-full min-h-44 md:min-h-30' />

            <ScrollIndicator isGradientDark={isGradientDark} />
        </div>
    );
};
