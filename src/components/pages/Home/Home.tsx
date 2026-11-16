import { useOutletContext } from 'react-router-dom';

import { pageMeta } from '../../../content';
import { webPage } from '../../../content/structuredData.ts';
import { PageMeta, StructuredData } from '../../ui';
import { HomeAbout, HomeApps, HomeContact, HomeHero, HomeServices, HomeWork } from './modules';
import type { HomeContextProps } from './types.ts';

export const Home = () => {
    const { isGradientDark, handlePaletteChange } = useOutletContext<HomeContextProps>();

    return (
        <>
            <PageMeta {...pageMeta.home} />
            <StructuredData
                data={webPage(pageMeta.home.path, 'ijji labs', pageMeta.home.description)}
            />
            <HomeHero isGradientDark={isGradientDark} handlePaletteChange={handlePaletteChange} />
            <HomeAbout />
            <HomeServices />
            <HomeApps />
            <HomeWork />
            <HomeContact />
        </>
    );
};
