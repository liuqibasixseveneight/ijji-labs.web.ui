import type { ServiceCardProps } from '../../../../ui';

export const cardData: ServiceCardProps[] = [
    {
        title: 'Website Design & Development',
        description:
            'From concept to code — we design and build fast, modern websites tailored to your business. Every detail is considered, every page signed off by you before we build.',
        included: [
            'UX & visual design',
            'Responsive development',
            'Performance & accessibility',
            'Third-party integrations',
        ],
    },
    {
        title: 'Handover & Training',
        description:
            'Every project ends with a thorough handover. We provide documentation and a walkthrough session so you can manage your own content confidently — no ongoing dependency on us required.',
        included: [
            'Content management training',
            'Usage and maintenance documentation',
            'Walkthrough session',
            'Q&A before sign-off',
        ],
    },
    {
        title: 'Post-Launch Support',
        description:
            "If you'd rather not manage updates yourself, we offer a flexible support package. Maintenance and content changes are included with any post-launch support packages.",
        included: ['Content & copy updates', 'Software & plugin updates', 'Performance monitoring'],
        optional: true,
    },
];
