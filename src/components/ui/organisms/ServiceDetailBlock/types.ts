export interface ServiceDetailItem {
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
