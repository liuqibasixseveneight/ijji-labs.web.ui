import { ArtisticFrame, BadgeLinks } from '../../../../ui';
import { servicesImageOne } from '../../../../../assets/images';

const SERVICES_LINKS = [
    { label: 'Design & Development', href: '#service-1' },
    { label: 'Handover & Training', href: '#service-2' },
    { label: 'Post-Launch Support', href: '#service-3' },
    { label: 'FAQ', href: '#faq' },
];

export const ServicesHero = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 px-6 md:px-8 w-full flex-1 py-[8vh] flex flex-col'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6dvh]'>
                Services
            </h1>
            <p className='text-xl text-white/60 max-w-xl mb-4'>
                We design and build websites for businesses that care about quality — based in
                Leeds, working across the UK.
            </p>
            <p className='text-xl text-white/60 max-w-xl mb-10'>
                No account managers. No junior teams. You work directly with the people doing the
                work.
            </p>

            <div className='mb-12'>
                <BadgeLinks links={SERVICES_LINKS} />
            </div>

            <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                <img
                    src={servicesImageOne}
                    alt='Web design and development workspace'
                    className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                />
            </ArtisticFrame>
        </div>
    </div>
);
