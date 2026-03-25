import { Link } from 'react-router-dom';

import { Button, NavbarLink } from '../../atoms';
import type { NavbarItem, NavbarProps } from './types.ts';
import { navbarItems } from './navbarItems.ts';

export const Navbar = ({ items }: NavbarProps) => {
    return (
        <nav
            className={
                'sticky top-8 z-50 my-8 h-20 backdrop-blur-md flex items-center justify-between px-30 bg-ui-background-primary/70'
            }
        >
            <div className='flex-1 items-center justify-center'>
                <Link to='/' className='text-4xl font-newsreader italic'>
                    ijji Labs
                </Link>
            </div>

            <div className='flex-1 flex justify-center'>
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

            <div className='flex-1  items-center flex justify-end'>
                <Button text={'Get in touch'} />
            </div>
        </nav>
    );
};
