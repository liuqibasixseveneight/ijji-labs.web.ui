import { ArtisticFrame, BadgeLinks } from '../../../../ui';
import { aboutImageOne } from '../../../../../assets/images';

const ABOUT_LINKS = [
    { label: 'Our story', href: '#our-story' },
    { label: 'Why independent?', href: '#why-independent' },
    { label: 'Your ownership', href: '#your-ownership' },
    { label: 'What we stand for', href: '#what-we-stand-for' },
];

export const AboutHero = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 px-6 md:px-8 w-full flex-1 py-[8vh] flex flex-col'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6dvh]'>
                About us
            </h1>
            <p className='text-xl text-white/60 max-w-xl mb-10'>
                A small, independent studio from Leeds — building the web with care, craft, and
                purpose.
            </p>
            <div className='mb-12'>
                <BadgeLinks links={ABOUT_LINKS} />
            </div>
            <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                <img
                    src={aboutImageOne}
                    alt='Shared computer office working space'
                    className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                />
            </ArtisticFrame>
        </div>
    </div>
);
