import { ProjectCard } from '../../../../ui';
import { projects } from './projects.ts';

export const HomeProjects = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 w-full flex-1 pt-[10vh] pb-[12vh] flex flex-col px-8'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white leading-none mb-6'>
                Our work
            </h2>
            <p className='text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-16'>
                A handful of recent projects — different clients, different problems, same standard
                of care.
            </p>

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
