import { clsx } from 'clsx';

import type { PlatformBadgesProps } from './types.ts';

const STORES = [
    { key: 'ios', label: 'App Store' },
    { key: 'android', label: 'Google Play' },
] as const;

/** Where an app is available: a link to each store, or "Coming soon" until it's live. */
export const PlatformBadges = ({ platforms, tone = 'dark' }: PlatformBadgesProps) => {
    const badge = clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase',
        tone === 'dark' ? 'border-white/20 text-white/70' : 'border-neutral-300 text-neutral-600',
    );

    return (
        <ul className='flex flex-wrap gap-3' aria-label='Availability'>
            {STORES.map(({ key, label }) => {
                const status = platforms[key];

                return (
                    <li key={key}>
                        {status === 'coming-soon' ? (
                            <span className={badge}>
                                {label}
                                <span
                                    className={
                                        tone === 'dark' ? 'text-brand-primary' : 'text-neutral-900'
                                    }
                                >
                                    Coming soon
                                </span>
                            </span>
                        ) : (
                            <a
                                href={status.url}
                                target='_blank'
                                rel='noreferrer'
                                className={clsx(
                                    badge,
                                    'hover:border-brand-primary transition-colors',
                                )}
                            >
                                Get it on {label}
                                <span className='sr-only'> (opens in a new tab)</span>
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
