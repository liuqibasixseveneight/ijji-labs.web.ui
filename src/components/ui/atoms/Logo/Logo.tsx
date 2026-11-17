import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import type { LogoProps } from './types.ts';

export const Logo = ({ isMenuOpen, isWhite }: LogoProps) => (
    <Link
        to='/'
        aria-label='ijji labs home'
        className={clsx(
            'whitespace-nowrap text-3xl md:text-4xl font-extrabold font-newsreader transition-all duration-300 ease-in-out',
            isMenuOpen || isWhite ? 'text-white' : 'text-ui-background-secondary',
        )}
    >
        ijji labs
    </Link>
);
