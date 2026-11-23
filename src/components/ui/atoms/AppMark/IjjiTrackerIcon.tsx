import { useId } from 'react';

/**
 * IJJI Tracker's icon, drawn as vectors so it stays sharp at any size, screen density or zoom.
 * Measured from the app's own 1024px icon.png (src/assets/images/apps/ijji-tracker.png): a
 * dark diagonal gradient, a grey track, and a lime ring three-quarters round with round caps,
 * shading from light at the top to deeper at the end, with a faint glow. The PNG still
 * serves structured data and anywhere an image file is needed.
 */
export const IjjiTrackerIcon = ({ className }: { className?: string }) => {
    // Unique per icon, so two on one page don't share gradients; plain characters only, as
    // url(#…) references don't take React's punctuation.
    const id = `ijji-tracker-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg viewBox='0 0 1024 1024' className={className} aria-hidden focusable='false'>
            <defs>
                <linearGradient
                    id={`${id}-bg`}
                    x1='0'
                    y1='0'
                    x2='1024'
                    y2='1024'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop offset='0' stopColor='#1E2129' />
                    <stop offset='0.5' stopColor='#13151A' />
                    <stop offset='1' stopColor='#0B0C0F' />
                </linearGradient>
                {/* The ring shades round its sweep: one gradient per quarter, meeting in colour. */}
                <linearGradient
                    id={`${id}-a`}
                    x1='512'
                    y1='250'
                    x2='774'
                    y2='512'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop offset='0' stopColor='#C8F542' />
                    <stop offset='1' stopColor='#BDEE2C' />
                </linearGradient>
                <linearGradient
                    id={`${id}-b`}
                    x1='774'
                    y1='512'
                    x2='512'
                    y2='774'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop offset='0' stopColor='#BDEE2C' />
                    <stop offset='1' stopColor='#B3E716' />
                </linearGradient>
                <linearGradient
                    id={`${id}-c`}
                    x1='512'
                    y1='774'
                    x2='250'
                    y2='512'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop offset='0' stopColor='#B3E716' />
                    <stop offset='1' stopColor='#A8E000' />
                </linearGradient>
                <filter id={`${id}-glow`} x='-20%' y='-20%' width='140%' height='140%'>
                    <feGaussianBlur stdDeviation='16' />
                </filter>
            </defs>

            <rect width='1024' height='1024' fill={`url(#${id}-bg)`} />
            <circle cx='512' cy='512' r='262' fill='none' stroke='#303237' strokeWidth='88' />
            <path
                d='M512 250A262 262 0 1 1 250 512'
                fill='none'
                stroke='#B8EB21'
                strokeWidth='88'
                strokeLinecap='round'
                opacity='0.22'
                filter={`url(#${id}-glow)`}
            />
            <g fill='none' strokeWidth='88' strokeLinecap='round'>
                <path d='M512 774A262 262 0 0 1 250 512' stroke={`url(#${id}-c)`} />
                <path d='M774 512A262 262 0 0 1 512 774' stroke={`url(#${id}-b)`} />
                <path d='M512 250A262 262 0 0 1 774 512' stroke={`url(#${id}-a)`} />
            </g>
        </svg>
    );
};
