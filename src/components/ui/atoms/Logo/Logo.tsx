import { Link } from 'react-router-dom';

import type { LogoProps } from './types.ts';

export const Logo = ({ isMenuOpen, isWhite }: LogoProps) => {
    return (
        <Link
            to={'/'}
            className={`text-4xl font-extrabold font-newsreader transition-all duration-300 ease-in-out
                ${isMenuOpen ? 'text-white' : 'text-ui-background-secondary'}
                ${isWhite && 'text-white'}`}
        >
            ijji labs
        </Link>
    );
};
