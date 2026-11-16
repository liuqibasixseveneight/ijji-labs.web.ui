export interface ProjectCardProps {
    /** Shown above the name, e.g. `01`. */
    number: string;
    /** The element id, so a `#anchor` link can jump to this card. */
    anchor?: string;
    name: string;
    description: string;
    services: string[];
    mockup?: string;
    flip?: boolean;
}
