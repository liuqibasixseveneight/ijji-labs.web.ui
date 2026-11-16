/** What a message can be about. `TOPICS` maps a `?topic=` in the URL to one of these. */
export const PROJECT_TYPES = [
    'New website project',
    'Website redesign',
    'Website maintenance & support',
    'E-commerce website',
    'Web application',
    'Branding + website',
    'Ongoing partnership / collaboration',
    'Help with IJJI Tracker',
    'Other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** `/contact?topic=support` chooses "Help with IJJI Tracker". */
export const TOPICS: Record<string, ProjectType> = {
    support: 'Help with IJJI Tracker',
    website: 'New website project',
};

/** Topics that are a request for help, not a project: no phone number needed. */
export const SUPPORT_TYPES: readonly ProjectType[] = ['Help with IJJI Tracker'];

export const CONTACT_METHODS = ['Email', 'Phone', 'SMS'] as const;
