import { ArtisticFrame, BadgeLinks } from '../../../../ui';
import { projectsImageOne } from '../../../../../assets/images';

const PROJECTS_LINKS = [
    { label: 'CluedIn', href: '#project-cluedin' },
    { label: 'Dedalus', href: '#project-dedalus' },
    { label: 'DXC Technology', href: '#project-dxc' },
    { label: 'Our approach', href: '#our-approach' },
];

export const ProjectsHero = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 px-6 md:px-8 w-full flex-1 py-[8vh] flex flex-col'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6dvh]'>
                Our work
            </h1>
            <p className='text-xl text-white/60 max-w-xl mb-10'>
                A handful of recent projects — different clients, different problems, same standard
                of care.
            </p>
            <div className='mb-12'>
                <BadgeLinks links={PROJECTS_LINKS} />
            </div>
            <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                <img
                    src={projectsImageOne}
                    alt='Design and development workspace'
                    className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                />
            </ArtisticFrame>
        </div>
    </div>
);
