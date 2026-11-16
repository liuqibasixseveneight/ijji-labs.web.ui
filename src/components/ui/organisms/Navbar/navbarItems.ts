import { paths } from '../../../../router/paths.ts';
import type { NavMenuItemLink } from '../../atoms';

export const navbarItems: NavMenuItemLink[] = [
    { label: 'Home', to: paths.home, num: '00', description: 'Welcome' },
    { label: 'About', to: paths.about, num: '01', description: 'Who we are' },
    { label: 'Services', to: paths.services, num: '02', description: 'What we do' },
    { label: 'Projects', to: paths.projects, num: '03', description: 'Our work' },
    { label: 'Apps', to: paths.apps, num: '04', description: 'What we make' },
    { label: 'Contact', to: paths.contact, num: '05', description: 'Say hello' },
];
