import { HomeAbout, HomeContact, HomeHero, HomeProjects, HomeServices } from './modules';

export const Home = () => {
    return (
        <>
            <HomeHero />
            <HomeAbout />
            <HomeServices />
            <HomeProjects />
            <HomeContact />
        </>
    );
};
