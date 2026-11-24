import { clsx } from 'clsx';
import type { ComponentType } from 'react';

import { appIcons } from '../../../../assets/images';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage.tsx';
import { IjjiTrackerIcon } from './IjjiTrackerIcon.tsx';
import type { AppMarkProps } from './types.ts';

const SIZES = {
    sm: { frame: 'w-8 h-8 rounded-[0.55rem]', sizes: '32px' },
    md: { frame: 'w-20 h-20 rounded-[1.25rem]', sizes: '80px' },
    lg: {
        frame: 'w-32 h-32 md:w-40 md:h-40 rounded-[1.8rem] md:rounded-[2.25rem]',
        sizes: '(min-width: 768px) 160px, 128px',
    },
} as const;

/**
 * Apps whose icon is drawn as vectors, so it's sharp at every size and screen. An app without
 * one shows its icon.png through `appIcons`.
 */
const VECTOR_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    'ijji-tracker': IjjiTrackerIcon,
};

/**
 * An app's own icon, in the rounded app-icon shape. Decorative: the app's name is always
 * written beside it.
 */
export const AppMark = ({ slug, size = 'md', priority = false }: AppMarkProps) => {
    const Vector = VECTOR_ICONS[slug];

    return (
        <span
            className={clsx(
                // No glow under the tile: it hazes the icon's edges.
                'inline-block shrink-0 overflow-hidden ring-1 ring-white/10',
                SIZES[size].frame,
            )}
        >
            {Vector ? (
                <Vector className='block w-full h-full' />
            ) : (
                <ResponsiveImage
                    image={appIcons[slug]}
                    alt=''
                    sizes={SIZES[size].sizes}
                    priority={priority}
                    className='block w-full h-full'
                />
            )}
        </span>
    );
};
