import { Logo, NavbarLink } from '../../atoms';
import { footerLinks } from './footerLinks.ts';

export const Footer = () => (
    <footer className='bg-ui-background-secondary py-10'>
        <div className='max-w-380 px-6 md:px-8 mx-auto flex flex-col md:flex-row justify-between items-start md:items-center'>
            <div className='flex flex-col items-start text-ui-text-secondary text-sm'>
                <Logo isWhite />
                <div className='uppercase mt-4 md:mt-2 mb-2'>
                    &copy; 2026 ijji labs. All rights reserved.
                </div>
                <div className='italic text-xs'>Built by humans.</div>
            </div>

            <nav aria-label='Footer' className='flex justify-start md:justify-end mt-8 md:mt-0'>
                <ul className='flex items-center gap-6 md:gap-10'>
                    {footerLinks.map((item) => (
                        <NavbarLink
                            key={item.to}
                            text={item.text}
                            to={item.to}
                            className='text-sm text-ui-text-secondary'
                        />
                    ))}
                </ul>
            </nav>
        </div>
    </footer>
);
