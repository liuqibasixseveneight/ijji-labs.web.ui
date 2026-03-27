import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className='absolute top-0 left-0 w-full z-10 h-[10vh] flex items-center justify-center bg-transparent'>
            <div className='flex-1 flex items-center justify-between h-full w-full max-w-360 px-10'>
                <Link
                    to='/'
                    className='text-4xl font-extrabold font-newsreader text-ui-background-secondary'
                >
                    ijji labs
                </Link>

                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className='relative w-10 h-10 flex items-center justify-center cursor-pointer'
                    aria-label='Toggle menu'
                >
                    <span
                        className={`absolute h-0.5 w-6 bg-ui-background-secondary transition-all duration-300 ease-in-out ${
                            isOpen ? 'rotate-45' : '-translate-y-1.5'
                        }`}
                    />
                    <span
                        className={`absolute h-0.5 w-6 bg-ui-background-secondary transition-all duration-300 ease-in-out ${
                            isOpen ? '-rotate-45' : 'translate-y-1.5'
                        }`}
                    />
                </button>
            </div>
        </nav>
    );
};
