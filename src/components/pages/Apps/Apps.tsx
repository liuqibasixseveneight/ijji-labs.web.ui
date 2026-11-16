import { apps, pageMeta } from '../../../content';
import { contactAbout } from '../../../router/paths.ts';
import { AppCard, CtaBand, PageHero, PageMeta, Section, StructuredData } from '../../ui';
import * as ld from '../../../content/structuredData.ts';

/** /apps: the apps we make ourselves. */
export const Apps = () => (
    <>
        <PageMeta {...pageMeta.apps} />
        <StructuredData
            data={ld.webPage(
                pageMeta.apps.path,
                'Apps by ijji labs',
                pageMeta.apps.description,
                'CollectionPage',
                {
                    mainEntity: {
                        '@type': 'ItemList',
                        itemListElement: apps.map((app, index) => ({
                            '@type': 'ListItem',
                            position: index + 1,
                            item: ld.mobileApplication(app),
                        })),
                    },
                },
            )}
        />

        <PageHero
            title='Apps'
            lede={[
                'Alongside client work, we design, build and run apps of our own — held to the same standard we bring to every project.',
            ]}
        />

        <Section tone='dark' spacing='md' labelledBy='our-apps-title'>
            <h2 id='our-apps-title' className='sr-only'>
                Our apps
            </h2>
            <div className='flex flex-col gap-[8vh]'>
                {apps.map((app) => (
                    <AppCard key={app.slug} app={app} />
                ))}
            </div>
        </Section>

        <CtaBand
            tone='light'
            title='Need help with IJJI Tracker?'
            lede='Questions, problems or ideas: send us a message and we’ll take it from there.'
            action={{ label: 'Ask for help', to: contactAbout('support') }}
        />
    </>
);
