import { Link } from 'react-router-dom';

import { Button, NavbarLink } from '../../atoms';
import type { NavbarItem, NavbarProps } from './types.ts';
import { navbarItems } from './navbarItems.ts';

export const Navbar = ({ items }: NavbarProps) => {
    return (
        <nav className='sticky top-10 z-50 w-full'>
            <div className='flex justify-center'>
                <div
                    className={`flex h-20 items-center justify-between rounded-full w-full max-w-376 px-8 transition-colors duration-300 bg-ui-background-secondary`}
                >
                    <div className='flex-1 flex items-center'>
                        <Link to='/' className='text-4xl font-newsreader font-extrabold'>
                            ijji labs
                        </Link>
                    </div>

                    <div className='flex-1 flex justify-center items-center'>
                        <ul className='flex items-center gap-8'>
                            {(items || navbarItems)?.map((item: NavbarItem, index: number) => (
                                <NavbarLink
                                    to={item.to}
                                    text={item.text}
                                    key={`${item.text}-${index}`}
                                />
                            ))}
                        </ul>
                    </div>

                    <div className='flex-1 flex items-center justify-end'>
                        <Button text='Get in touch' />
                    </div>
                </div>
            </div>
        </nav>
    );
};
