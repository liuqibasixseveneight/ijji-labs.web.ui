import { apps, homeCopy } from '../../../../../content';
import { paths } from '../../../../../router/paths.ts';
import { AppCard, MoreLink, Section, SectionIntro } from '../../../../ui';

/** Our own apps, featured on Home. */
export const HomeApps = () => (
    <Section tone='dark' labelledBy='home-apps-title' innerClassName='pb-0'>
        <SectionIntro id='home-apps-title' title={homeCopy.apps.title} lede={homeCopy.apps.lede} />
        <div className='flex flex-col gap-[5vh]'>
            {apps.map((app) => (
                <AppCard key={app.slug} app={app} />
            ))}
        </div>
        <MoreLink to={paths.apps} className='mt-[6vh]'>
            See our apps
        </MoreLink>
    </Section>
);
