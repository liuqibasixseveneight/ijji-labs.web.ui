import { useEffect, useState } from 'react';

import type { ScrollIndicatorProps } from './types.ts';

export const ScrollIndicator = ({ isGradientDark }: ScrollIndicatorProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY < 80);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`absolute bottom-35 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-500 ${
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <span
                className={`font-bold text-sm tracking-widest uppercase ${
                    isGradientDark ? 'text-white/50' : 'text-ui-background-secondary/50'
                }`}
            >
                Scroll to explore
            </span>
            <div className='flex flex-col items-center gap-0.5'>
                {[0, 1, 2].map((i) => (
                    <svg
                        key={i}
                        width='18'
                        height='10'
                        viewBox='0 0 18 10'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className={`animate-scroll-chevron ${
                            isGradientDark ? 'text-white' : 'text-ui-background-secondary'
                        }`}
                        style={{ animationDelay: `${i * 180}ms` }}
                    >
                        <path
                            d='M1 1L9 9L17 1'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                ))}
            </div>
        </div>
    );
};
