import { homeCopy, projects } from '../../../../../content';
import { paths } from '../../../../../router/paths.ts';
import { MoreLink, ProjectCard, Section, SectionIntro } from '../../../../ui';

/** Client work, featured on Home. */
export const HomeWork = () => (
    <Section tone='dark' labelledBy='home-work-title' innerClassName='pb-[12vh]'>
        <SectionIntro id='home-work-title' title={homeCopy.work.title} lede={homeCopy.work.lede} />
        <div className='flex flex-col gap-[5vh]'>
            {projects.map((project, index) => (
                <ProjectCard key={project.number} flip={index % 2 !== 0} {...project} />
            ))}
        </div>
        <MoreLink to={paths.projects} className='mt-[6vh]'>
            All projects
        </MoreLink>
    </Section>
);
