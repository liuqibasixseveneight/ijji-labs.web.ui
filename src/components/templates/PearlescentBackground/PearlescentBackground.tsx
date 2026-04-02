import type { PearlescentBackgroundProps } from './types';
import { grainPattern, noisePattern } from './constants.ts';

export const PearlescentBackground = ({ children, className = '' }: PearlescentBackgroundProps) => {
    return (
        <div className={`relative flex-1 ${className}`}>
            {/* Background */}
            <div
                className='absolute inset-0'
                style={{
                    background: `
            radial-gradient(ellipse 140% 110% at 35% 40%, #f8f8f8 0%, #d8d8d8 50%, #c0c0c0 100%),
            radial-gradient(ellipse 65% 55% at 18% 22%, rgba(255, 100, 150, 1), rgba(255, 100, 150, 0.6) 30%, transparent 52%),
            radial-gradient(ellipse 70% 60% at 75% 18%, rgba(100, 190, 255, 1), rgba(100, 190, 255, 0.6) 35%, transparent 58%),
            radial-gradient(ellipse 75% 65% at 48% 65%, rgba(100, 255, 190, 1), rgba(100, 255, 190, 0.6) 35%, transparent 57%),
            radial-gradient(ellipse 60% 55% at 85% 78%, rgba(255, 225, 120, 1), rgba(255, 225, 120, 0.6) 30%, transparent 53%),
            radial-gradient(ellipse 68% 58% at 38% 52%, rgba(190, 120, 255, 1), rgba(190, 120, 255, 0.6) 35%, transparent 56%),
            radial-gradient(ellipse 62% 68% at 63% 32%, rgba(255, 150, 200, 1), rgba(255, 150, 200, 0.6) 30%, transparent 54%),
            radial-gradient(ellipse 58% 70% at 28% 82%, rgba(140, 215, 255, 1), rgba(140, 215, 255, 0.6) 35%, transparent 58%),
            radial-gradient(ellipse 90% 80% at 55% 45%, rgba(255, 255, 255, 0.7), transparent 58%)
          `,
                    backgroundBlendMode:
                        'lighten, screen, screen, screen, screen, screen, screen, screen, screen',
                    boxShadow: `
            inset 25px -35px 110px rgba(255,255,255,0.8),
            inset -30px 25px 110px rgba(255,255,255,0.7),
            0 0 150px rgba(255,255,255,0.4)
          `,
                }}
            />

            {/* Grain */}
            <div
                className='absolute inset-0 mix-blend-overlay opacity-60'
                style={{
                    backgroundImage: grainPattern,
                }}
            />

            {/* Noise */}
            <div
                className='absolute inset-0 mix-blend-soft-light opacity-50'
                style={{
                    backgroundImage: noisePattern,
                }}
            />

            {/* Content */}
            <div className='relative z-10 w-full h-full'>{children}</div>
        </div>
    );
};
