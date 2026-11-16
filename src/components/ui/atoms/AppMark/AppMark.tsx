import { clsx } from 'clsx';

import { appIcons } from '../../../../assets/images';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage.tsx';
import type { AppMarkProps } from './types.ts';

const SIZES = {
    md: { frame: 'w-20 h-20 rounded-[1.25rem]', sizes: '80px' },
    lg: {
        frame: 'w-32 h-32 md:w-40 md:h-40 rounded-[1.8rem] md:rounded-[2.25rem]',
        sizes: '(min-width: 768px) 160px, 128px',
    },
} as const;

/**
 * An app's own icon, in the rounded app-icon shape. Decorative: the app's name is always
 * written beside it.
 */
export const AppMark = ({ slug, size = 'md', priority = false }: AppMarkProps) => (
    <span
        className={clsx(
            'inline-block shrink-0 overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_-20px_rgba(190,240,40,0.35)]',
            SIZES[size].frame,
        )}
    >
        <ResponsiveImage
            image={appIcons[slug]}
            alt=''
            sizes={SIZES[size].sizes}
            priority={priority}
            className='block w-full h-full'
        />
    </span>
);
