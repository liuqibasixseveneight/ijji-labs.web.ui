import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, NavbarLink } from '../../atoms';
import type { NavbarItem, NavbarProps } from './types.ts';
import { navbarItems } from './navbarItems.ts';

export const Navbar = ({ items }: NavbarProps) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 0;
            setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`sticky top-8 z-50 my-8 h-20 backdrop-blur-md flex items-center justify-between px-10 mx-auto w-full max-w-420 transition-colors duration-300 ${isScrolled ? 'bg-ui-background-secondary/80' : 'bg-transparent'}`}
        >
            <div className='flex-1 flex items-center'>
                <Link to='/' className='text-4xl font-newsreader italic'>
                    ijji Labs
                </Link>
            </div>

            <div className='flex-1 flex justify-center items-center'>
                <ul className='flex items-center gap-8'>
                    {(items || navbarItems)?.map((item: NavbarItem, index: number) => (
                        <NavbarLink
                            to={item?.to}
                            text={item?.text}
                            key={`${item?.text}-${index}`}
                        />
                    ))}
                </ul>
            </div>

            <div className='flex-1 flex items-center justify-end'>
                <Button text={'Get in touch'} />
            </div>
        </nav>
    );
};
