import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HamburgerIcon } from '../../atoms';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenNavMenu = () => {
        setIsOpen((prevState) => !prevState);
    };

    return (
        <nav className='absolute top-0 left-0 w-full z-10 h-[10vh] flex items-center justify-center bg-transparent'>
            <div className='flex-1 flex items-center justify-between h-full w-full max-w-360'>
                <Link
                    to='/'
                    className='text-4xl font-extrabold font-newsreader text-ui-background-secondary'
                >
                    ijji labs
                </Link>

                <HamburgerIcon isOpen={isOpen} setIsOpen={handleOpenNavMenu} />
            </div>
        </nav>
    );
};
