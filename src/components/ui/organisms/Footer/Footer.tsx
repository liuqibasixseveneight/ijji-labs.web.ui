import { navbarItems } from '../Navbar/navbarItems.ts';
import { NavbarLink } from '../../atoms';
import type { NavbarItem } from '../Navbar';

export const Footer = () => {
    return (
        <footer className={'h-50 max-h-50 bg-ui-background-secondary px-30 py-10 flex-1'}>
            <div className={'flex-1 max-w-420 mx-auto'}>
                <div className={'text-2xl font-newsreader italic mb-6 text-white'}>ijji Labs</div>

                <div className='flex-1 flex items center justify-between'>
                    <div className='flex-1 flex flex-col items-start justify-center text-ui-text-secondary text-sm'>
                        <div>&copy; ijji Labs 2026. All rights reserved.</div>
                        <div>Built by a human.</div>
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
