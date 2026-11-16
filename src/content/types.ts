/** A run of text in a policy. Strings are plain; links and emphasis are spelled out. */
export type Inline = string | { text: string; href: string } | { strong: string };

/** One block in a policy section. */
export type PolicyBlock =
    | { type: 'paragraph'; text: Inline[] }
    | { type: 'list'; items: Inline[][] }
    | { type: 'table'; head: string[]; rows: Inline[][][] }
    /** A highlighted aside, e.g. "In short: …". */
    | { type: 'note'; text: Inline[] };

export interface PolicySection {
    /** A stable `#id`; links to it are shared, so don't rename. */
    id: string;
    heading: string;
    blocks: PolicyBlock[];
    /** Optional questions and answers shown under the blocks (support pages). */
    faqs?: { question: string; answer: Inline[] }[];
}

export interface PolicyDocument {
    title: string;
    /** One or two sentences under the title. */
    summary: string;
    /** When this version took effect, as `YYYY-MM-DD`. Update it with every change. */
    effectiveDate: string;
    sections: PolicySection[];
}

export type PlatformStatus = 'coming-soon' | { url: string };

export interface AppFeature {
    title: string;
    description: string;
}

/** One of our own apps. The site builds its page and policy pages from this. */
export interface AppEntry {
    /** In the URL (`/apps/<slug>`). Never change it once the store listings use it. */
    slug: string;
    name: string;
    /** A short line under the name. */
    tagline: string;
    /** A paragraph on what it's for. */
    summary: string;
    /** For search results and link previews: 160 characters at most. */
    description: string;
    features: AppFeature[];
    platforms: { ios: PlatformStatus; android: PlatformStatus };
    /** iOS bundle ID and Android package. */
    bundleId: string;
    minimumAge: number;
    policies: {
        privacy: PolicyDocument;
        terms: PolicyDocument;
        support: PolicyDocument;
        deletion: PolicyDocument;
    };
}
