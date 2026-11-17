import { useParams } from 'react-router-dom';

import { findApp } from '../../../content';
import { paths } from '../../../router/paths.ts';
import {
    AppMark,
    CtaBand,
    FeatureGrid,
    PageHero,
    PageMeta,
    PlatformBadges,
    PolicyLinks,
    Section,
    SectionIntro,
    StructuredData,
} from '../../ui';
import * as ld from '../../../content/structuredData.ts';

import { NotFound } from '../NotFound';

/** /apps/:appSlug — one of our apps: what it does, where to get it, and its policies. */
export const AppDetail = () => {
    const app = findApp(useParams().appSlug);
    if (!app) return <NotFound />;

    const to = paths.app(app.slug);

    return (
        <>
            <PageMeta title={app.name} description={app.description} path={to.root} />
            <StructuredData data={ld.mobileApplication(app)} />
            <StructuredData
                data={ld.webPage(to.root, app.name, app.description, 'WebPage', {
                    mainEntity: { '@id': ld.mobileApplication(app)['@id'] },
                })}
            />
            <StructuredData
                data={ld.breadcrumbs([
                    { name: 'Apps', path: paths.apps },
                    { name: app.name, path: to.root },
                ])}
            />

            <PageHero
                title={app.name}
                lede={[app.tagline, app.summary]}
                links={[
                    { label: 'What it does', href: '#features' },
                    { label: 'Privacy and support', href: '#privacy-and-support' },
                ]}
            >
                <div className='flex flex-col sm:flex-row sm:items-center gap-8 mb-4'>
                    <AppMark slug={app.slug} size='lg' priority />
                    <PlatformBadges platforms={app.platforms} />
                </div>
            </PageHero>

            <Section id='features' tone='light' width='grid' labelledBy='features-title'>
                <SectionIntro
                    id='features-title'
                    tone='light'
                    title='What it does'
                    lede={`Everything in ${app.name} is there to help you show up for the things that matter to you.`}
                />
                <FeatureGrid features={app.features} />
            </Section>

            <Section id='privacy-and-support' tone='dark' labelledBy='privacy-and-support-title'>
                <SectionIntro
                    id='privacy-and-support-title'
                    title='Privacy and support'
                    lede={`No ads, no analytics, no tracking. ${app.name} keeps only what it needs to work, and you can export or delete it whenever you like. For people ${app.minimumAge} and over.`}
                />
                <PolicyLinks app={app} />
            </Section>

            <CtaBand
                tone='light'
                title={`Questions about ${app.name}?`}
                lede='Our support page has answers to the common ones, and a way to reach us for everything else.'
                action={{ label: 'Get support', to: to.support }}
            />
        </>
    );
};
