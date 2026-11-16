import { useOutletContext } from 'react-router-dom';

import { HomeAbout, HomeContact, HomeHero, HomeProjects, HomeServices } from './modules';
import type { HomeContextProps } from './types.ts';

export const Home = () => {
    const { isGradientDark, handlePaletteChange } = useOutletContext<HomeContextProps>();

    return (
        <>
            <HomeHero isGradientDark={isGradientDark} handlePaletteChange={handlePaletteChange} />
            <HomeAbout />
            <HomeServices />
            <HomeProjects />
            <HomeContact />
        </>
    );
};
