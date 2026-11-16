import { Link } from 'react-router-dom';

import { paths } from '../../../../router/paths.ts';
import type { PolicyLinksProps } from './types.ts';

/** An app's four pages (privacy, terms, support, deletion), as a list of cards. */
export const PolicyLinks = ({ app }: PolicyLinksProps) => {
    const to = paths.app(app.slug);
    const links = [
        { href: to.privacy, document: app.policies.privacy, label: 'Privacy policy' },
        { href: to.terms, document: app.policies.terms, label: 'Terms of use' },
        { href: to.support, document: app.policies.support, label: 'Support' },
        { href: to.deleteAccount, document: app.policies.deletion, label: 'Delete your account' },
    ];

    return (
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800 border border-neutral-800'>
            {links.map(({ href, document, label }) => (
                <li key={href} className='bg-ui-background-primary'>
                    <Link
                        to={href}
                        className='group flex flex-col gap-3 p-6 sm:p-8 h-full hover:bg-white/3 transition-colors'
                    >
                        <span className='flex items-center justify-between gap-4 text-xl font-semibold text-white group-hover:text-brand-primary transition-colors'>
                            {label}
                            <svg
                                viewBox='0 0 14 14'
                                fill='none'
                                aria-hidden='true'
                                className='w-3 h-3 shrink-0 stroke-current'
                            >
                                <path
                                    d='M1 13L13 1M13 1H4M13 1V10'
                                    strokeWidth='1.2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </span>
                        <span className='text-sm sm:text-base text-neutral-400 leading-relaxed'>
                            {document.summary}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
};
