import type { ProjectListItemProps } from '../../../../ui';

export const projectListItems: ProjectListItemProps[] = [
    {
        img: {
            src: 'https://images.unsplash.com/photo-1667372335962-5fd503a8ae5b?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: '3D art of infinity logo on a chipset',
        },
        title: 'CluedIn',
        description:
            'CluedIn is a data management platform that helps organizations unify, clean, and enrich their data - creating a single, reliable view of their information for better insights and decision-making.',
    },
    {
        img: {
            src: 'https://images.unsplash.com/photo-1485848395967-65dff62dc35b?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: '3D art of infinity logo on a chipset',
        },
        title: 'Dedalus',
        description:
            'Dedalus is a global healthcare technology company that provides software solutions to hospitals and health systems, helping manage clinical, administrative, and patient data to improve care and efficiency.',
        imagePosition: 'right' as const,
    },
    {
        img: {
            src: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: '3D art of infinity logo on a chipset',
        },
        title: 'DXC Technology',
        description:
            'DXC Technology is a global IT services company that helps businesses modernize their systems, manage infrastructure, and transform digitally through cloud, analytics, and enterprise solutions.',
    },
];
