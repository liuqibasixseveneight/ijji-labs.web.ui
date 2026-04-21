import { ProjectCard } from '../../../../ui';
import { projects } from '../../../Home/modules/HomeProjects/projects.ts';

export const ProjectsList = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 w-full flex-1 py-[8vh] flex flex-col px-6 md:px-8'>
            <div className='flex flex-col gap-[5vh]'>
                {projects.map((project, index: number) => (
                    <ProjectCard
                        key={`${project.id}-${index}`}
                        flip={index % 2 !== 0}
                        {...project}
                    />
                ))}
            </div>
        </div>
    </div>
);
