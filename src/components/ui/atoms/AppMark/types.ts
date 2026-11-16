export interface AppMarkProps {
    /** The app's slug; its icon comes from `appIcons` in src/assets/images. */
    slug: string;
    /** @default 'md' */
    size?: 'md' | 'lg';
    /** Load it straight away, when it's at the top of the page. @default false */
    priority?: boolean;
}
