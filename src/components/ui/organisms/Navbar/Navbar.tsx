import { useState } from 'react';

import { HamburgerIcon, Logo } from '../../atoms';
import { NavMenu } from '../../molecules';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenNavMenu = () => {
        setIsOpen((prevState) => !prevState);
    };

    return (
        <>
            <nav className='sticky top-0 left-0 w-full z-20 h-[10vh] bg-transparent'>
                <div className='flex-1 flex items-center justify-between h-full w-full max-w-360 mx-auto'>
                    <Logo isMenuOpen={isOpen} />
                    <HamburgerIcon isOpen={isOpen} setIsOpen={handleOpenNavMenu} />
                </div>
            </nav>

            <NavMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};
