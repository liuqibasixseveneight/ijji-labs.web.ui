import { apps } from '../../../../content/apps.ts';
import { site } from '../../../../content/site.ts';
import { paths } from '../../../../router/paths.ts';
import type { NavbarLinkProps } from '../../atoms';

type FooterLink = Pick<NavbarLinkProps, 'text' | 'to'>;

export const footerLinks: FooterLink[] = [
    { to: paths.about, text: 'About' },
    { to: paths.services, text: 'Services' },
    { to: paths.projects, text: 'Projects' },
    { to: paths.apps, text: 'Apps' },
    { to: paths.contact, text: 'Contact' },
];

/** The policies, so they're one click from every page (the stores' reviewers look). */
export const legalLinks: { group: string; links: FooterLink[] }[] = [
    { group: site.name, links: [{ to: paths.privacy, text: 'Privacy' }] },
    ...apps.map((app) => {
        const to = paths.app(app.slug);
        return {
            group: app.name,
            links: [
                { to: to.privacy, text: 'Privacy' },
                { to: to.terms, text: 'Terms' },
                { to: to.support, text: 'Support' },
                { to: to.deleteAccount, text: 'Delete account' },
            ],
        };
    }),
];
