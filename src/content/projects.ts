import type { ProjectCardProps } from '../components/ui';

/**
 * Client work, on Home (Our work) and /projects, where Projects' badge links jump to each
 * `anchor`. Descriptions are drafted from each client's field: check them against the real
 * engagements before release.
 */
export const projects: ProjectCardProps[] = [
    {
        number: '01',
        anchor: 'project-cluedin',
        name: 'CluedIn',
        description:
            'A master data management platform that helps organisations unify, clean and enrich their data. We worked on the product experience, making complex data tools clear and approachable.',
        services: ['Master Data Management', 'Data Governance', 'Enterprise SaaS'],
        mockup: 'https://images.unsplash.com/photo-1662633271540-b7e2f4df2bcb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        number: '02',
        anchor: 'project-dedalus',
        name: 'Dedalus',
        description:
            'Healthcare software used by hospitals and health systems. Interfaces where clarity matters most, designed so clinicians find what they need quickly.',
        services: ['Healthcare Technology', 'Electronic Health Records', 'Digital Health'],
        mockup: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        number: '03',
        anchor: 'project-dxc',
        name: 'DXC Technology',
        description:
            'A global IT services company helping businesses modernise their systems. Work on digital tools for enterprise teams, built for scale and long-term maintainability.',
        services: ['IT Services', 'Digital Transformation', 'Enterprise Consulting'],
        mockup: 'https://images.unsplash.com/photo-1623654803446-df2b3456cccd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];
