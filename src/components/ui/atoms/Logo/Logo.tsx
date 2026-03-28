import { Link } from 'react-router-dom';

import type { LogoProps } from './types.ts';

export const Logo = ({ isMenuOpen }: LogoProps) => {
    return (
        <Link
            to={'/'}
            className={`text-4xl font-extrabold font-newsreader transition-all duration-300 ease-in-out ${isMenuOpen ? 'text-white' : 'text-ui-background-secondary'}`}
        >
            ijji labs
        </Link>
    );
};
