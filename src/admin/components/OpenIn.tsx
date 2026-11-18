import type { ReactNode } from 'react';
import { clsx } from 'clsx';

import { secondaryAction } from './styles.ts';

/** A link out to another service's dashboard (Supabase, Expo), saying it opens a new tab. */
export const OpenIn = ({
    href,
    service,
    children,
}: {
    href: string;
    /** Named for screen readers: "opens Supabase in a new tab". */
    service: string;
    children: ReactNode;
}) => (
    <a href={href} target='_blank' rel='noreferrer' className={clsx(secondaryAction, 'shrink-0')}>
        {children}
        <span aria-hidden='true'>↗</span>
        <span className='sr-only'> (opens {service} in a new tab)</span>
    </a>
);
