import { Logo, NavbarLink } from '../../atoms';
import type { NavbarItem } from '../Navbar';
import { footerLinks } from './footerLinks.ts';

export const Footer = () => {
    return (
        <footer className='bg-ui-background-secondary py-10'>
            <div className='max-w-380 px-8 mx-auto flex flex-col md:flex-row justify-between items-start md:items-center'>
                <div className='flex flex-col items-start text-ui-text-secondary text-sm'>
                    <Logo isWhite />
                    <div className='uppercase mt-2 mb-0'>
                        &copy; 2026 ijji labs. All rights reserved.
                    </div>
                    <div className='italic text-xs'>Built by a human.</div>
                </div>

                <div className='flex justify-start md:justify-end mt-4 md:mt-0'>
                    <ul className='flex items-center gap-6 md:gap-10'>
                        {footerLinks?.map((item: NavbarItem, index: number) => (
                            <NavbarLink
                                text={item?.text}
                                to={item?.to}
                                key={`${item?.text}-${index}`}
                                className='text-sm text-ui-text-secondary'
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};
