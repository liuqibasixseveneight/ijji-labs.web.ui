import { projectsImageOne } from '../../../assets/images';
import { pageMeta, projects } from '../../../content';
import { paths } from '../../../router/paths.ts';
import {
    CtaBand,
    MoreLink,
    PageHero,
    PageMeta,
    ProcessSection,
    ProjectCard,
    Section,
    StructuredData,
} from '../../ui';
import * as ld from '../../../content/structuredData.ts';

const LINKS = [
    ...projects.map((project) => ({ label: project.name, href: `#${project.anchor}` })),
    { label: 'Our approach', href: '#our-approach' },
];

export const Projects = () => (
    <>
        <PageMeta {...pageMeta.projects} />
        <StructuredData
            data={ld.webPage(
                pageMeta.projects.path,
                'Our work',
                pageMeta.projects.description,
                'CollectionPage',
            )}
        />

        <PageHero
            title='Our work'
            lede={[
                'A handful of recent client projects — different clients, different problems, same standard of care.',
            ]}
            links={LINKS}
            image={{ source: projectsImageOne, alt: 'Design and development workspace' }}
        />

        <Section tone='dark' spacing='md' labelledBy='client-work-title'>
            <h2 id='client-work-title' className='sr-only'>
                Client projects
            </h2>
            <div className='flex flex-col gap-[5vh]'>
                {projects.map((project, index) => (
                    <ProjectCard key={project.number} flip={index % 2 !== 0} {...project} />
                ))}
            </div>
            <MoreLink to={paths.apps} className='mt-[6vh]'>
                And the apps we make ourselves
            </MoreLink>
        </Section>

        <ProcessSection id='our-approach' />

        <CtaBand
            title='Got a project in mind?'
            lede='We take on a small number of projects at a time — so when we’re working with you, you have our full attention. Tell us what you’re looking for.'
            action={{ label: 'Get in touch', to: paths.contact }}
        />
    </>
);
