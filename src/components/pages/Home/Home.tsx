import { HomeContact, HomeHero, HomeProjects, HomeServices } from './modules';

export const Home = () => {
    return (
        <>
            {/* HERO */}
            <HomeHero />

            {/* SERVICES */}
            <HomeServices />

            {/* PROJECTS */}
            <HomeProjects />

            {/* CONTACT */}
            <HomeContact />
        </>
    );
};
