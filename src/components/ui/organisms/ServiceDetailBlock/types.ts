export interface ServiceDetailItem {
    /** Its `#anchor` on /services. Links to it are shared, so don't rename. */
    id: string;
    title: string;
    tagline: string;
    description: string;
    body: string[];
    included: string[];
    optional?: boolean;
}

export interface ServiceDetailBlockProps {
    service: ServiceDetailItem;
    index: number;
}
