import type { NavbarLinkProps } from '../../atoms';

export const footerLinks: Pick<NavbarLinkProps, 'text' | 'to'>[] = [
    { to: '/about', text: 'About' },
    { to: '/services', text: 'Services' },
    { to: '/projects', text: 'Projects' },
    { to: '/contact', text: 'Contact' },
];
