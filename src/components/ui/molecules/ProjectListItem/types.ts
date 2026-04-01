export interface ProjectListItemProps {
    img: {
        src: string;
        alt: string;
    };
    title: string;
    description: string;
    imagePosition?: 'left' | 'right';
}
