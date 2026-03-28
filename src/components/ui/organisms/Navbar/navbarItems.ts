import type { NavMenuItemProps } from '../../molecules';

export const navbarItems: NavMenuItemProps[] = [
    { label: 'Home', to: '/', num: '00', description: 'Welcome' },
    { label: 'About', to: '/about', num: '01', description: 'Who we are' },
    { label: 'Services', to: '/services', num: '02', description: 'What we do' },
    { label: 'Projects', to: '/projects', num: '03', description: 'Our work' },
    { label: 'Contact', to: '/contact', num: '04', description: 'Say hello' },
];
