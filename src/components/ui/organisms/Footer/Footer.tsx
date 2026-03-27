import { navbarItems } from '../Navbar/navbarItems.ts';
import { NavbarLink } from '../../atoms';
import type { NavbarItem } from '../Navbar';

export const Footer = () => {
    return (
        <footer className={'min-h-60 max-h-60 bg-ui-background-secondary px-30 py-10 flex-1 z-10'}>
            <div className={'flex-1 max-w-360 mx-auto'}>
                <div className='flex-1 flex-col mb-6'>
                    <div className={'text-4xl font-newsreader text-white mb-6 font-extrabold'}>
                        ijji labs
                    </div>
                </div>

                <div className='flex-1 flex items center justify-between'>
                    <div className='flex-1 flex flex-col items-start justify-center text-ui-text-secondary text-sm'>
                        <div className={'mb-2 uppercase'}>
                            &copy; 2026 ijji labs. All rights reserved.
                        </div>
                        <div className={'italic text-xs'}>Built by a human.</div>
                    </div>

                    <div className={'flex-1'}>
                        <ul className={'flex items-center justify-end gap-10'}>
                            {navbarItems?.map((item: NavbarItem, index: number) => (
                                <NavbarLink
                                    text={item?.text}
                                    to={item?.to}
                                    key={`${item?.text}-${index}`}
                                    className={'text-sm text-ui-text-secondary'}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};
