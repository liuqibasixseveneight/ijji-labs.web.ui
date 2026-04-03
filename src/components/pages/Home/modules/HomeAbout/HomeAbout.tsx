import { ArtisticFrame, InfoCard } from '../../../../ui';
import { aboutImageOne, aboutImageTwo } from '../../../../../assets/images';
import { valueCards } from './valueCards.ts';

export const HomeAbout = () => {
    return (
        <>
            <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
                <div className={'max-w-380 px-6 md:px-8 w-full flex-1 py-[10vh] flex flex-col'}>
                    <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10'>
                        About us
                    </h2>
                    <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                        <img
                            src={aboutImageOne}
                            alt='Shared computer office working space'
                            className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                        />
                    </ArtisticFrame>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[10vh] bg-white'>
                <div className={'max-w-260 w-full flex-1 flex flex-col mb-[5vh] px-6 md:px-8'}>
                    <h3 className={'text-3xl md:text-4xl font-medium mb-10'}>
                        At ijji labs, we focus on what matters most - your users
                    </h3>

                    <div className='flex-1 flex flex-col gap-8'>
                        <p className={'text-xl'}>
                            Founded in Leeds in 2026, ijji labs is an independent digital studio
                            dedicated to crafting fast, modern websites. We work closely with every
                            client, taking a hands-on approach to deliver thoughtful, high-quality
                            results that make an impact.
                        </p>
                        <p className={'text-xl'}>
                            As an independent studio, we value simplicity, clarity, and performance
                            in everything we create. We avoid unnecessary complexity, focusing
                            instead on delivering websites that are fast, reliable, and designed to
                            stand the test of time.
                        </p>
                        <p className={'text-xl'}>
                            From concept to launch, we work side by side with our clients, keeping
                            the process clear, collaborative, and focused. Once your website is
                            live, we ensure a smooth handover, equipping you with the knowledge and
                            confidence to take ownership moving forward.
                        </p>
                    </div>
                </div>

                <div className={'max-w-300 w-full flex-1 flex flex-col mb-10 px-6 md:px-8'}>
                    <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                        <img
                            src={aboutImageTwo}
                            alt='Two designers collaborating with laptops'
                            className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                        />
                    </ArtisticFrame>
                </div>

                <div className={'max-w-7xl w-full flex-1 flex flex-col my-10 px-6 md:px-8'}>
                    <h3 className={'text-3xl md:text-4xl font-medium mb-10'}>
                        What are our values?
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        {valueCards.map((card, index: number) => (
                            <InfoCard key={`${card?.title}-${index}`} {...card} />
                        ))}
                    </div>
                </div>

                <div className='flex-1 h-full flex flex-col items-center justify-center w-full mt-10 bg-white px-6 md:px-8'>
                    <div className={'max-w-260 w-full flex-1 flex flex-col mb-[5vh]'}>
                        <h3 className={'text-3xl md:text-4xl font-medium mb-10'}>
                            We really care!
                        </h3>

                        <div className='flex-1 flex flex-col gap-8'>
                            <p className={'text-xl'}>
                                As a small independent studio, we keep things personal. Your goals
                                guide every decision we make — from the first conversation through
                                to launch.
                            </p>
                            <p className={'text-xl'}>
                                Every project is built around your needs, with a collaborative
                                process that keeps things clear, focused, and aligned from start to
                                finish.
                            </p>
                            <p className={'text-xl'}>
                                When we hand things over, you won’t be left guessing — you’ll be
                                ready to take ownership with confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
