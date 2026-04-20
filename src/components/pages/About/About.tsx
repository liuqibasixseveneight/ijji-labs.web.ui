import { ArtisticFrame, InfoCard } from '../../ui';
import { aboutImageOne, aboutImageTwo } from '../../../assets/images';
import { valueCards } from '../Home/modules/HomeAbout/valueCards.ts';

export const About = () => {
    return (
        <>
            <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
                <div className='max-w-380 px-6 md:px-8 w-full flex-1 py-[8vh] flex flex-col'>
                    <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6dvh]'>
                        About us
                    </h1>
                    <p className='text-xl text-white/60 max-w-xl mb-12'>
                        A small, independent studio from Leeds — building the web with care, craft,
                        and purpose.
                    </p>
                    <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                        <img
                            src={aboutImageOne}
                            alt='Shared computer office working space'
                            className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                        />
                    </ArtisticFrame>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-white'>
                <div className='max-w-260 w-full flex-1 flex flex-col px-6 md:px-8'>
                    <h2 className='text-3xl md:text-4xl font-medium mb-10'>Our story</h2>
                    <div className='flex-1 flex flex-col gap-8'>
                        <p className='text-xl'>
                            Founded in Leeds in 2026, ijji labs is an independent digital studio
                            dedicated to crafting fast, modern websites. We work closely with every
                            client, taking a hands-on approach to deliver thoughtful, high-quality
                            results that make an impact.
                        </p>
                        <p className='text-xl'>
                            As an independent studio, we value simplicity, clarity, and performance
                            in everything we create. We avoid unnecessary complexity, focusing
                            instead on delivering websites that are fast, reliable, and designed to
                            stand the test of time.
                        </p>
                        <p className='text-xl'>
                            From concept to launch, we work side by side with our clients, keeping
                            the process clear, collaborative, and focused. Once your website is
                            live, we ensure a smooth handover, equipping you with the knowledge and
                            confidence to take ownership moving forward.
                        </p>
                    </div>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-ui-background-primary'>
                <div className='max-w-260 w-full flex-1 flex flex-col px-6 md:px-8'>
                    <h2 className='text-3xl md:text-4xl font-medium text-white mb-10'>
                        Why independent?
                    </h2>
                    <div className='flex-1 flex flex-col gap-8'>
                        <p className='text-xl text-white/70'>
                            Staying independent is a deliberate choice. It means every project is
                            handled directly — no account managers passing briefs down the chain, no
                            junior teams doing the work while a senior takes the credit. When you
                            work with ijji labs, you work with the person doing the work.
                        </p>
                        <p className='text-xl text-white/70'>
                            Bigger studios come with bigger overheads, broader processes, and a
                            client list wide enough that you can get lost in it. We keep our focus
                            narrow on purpose — so that the attention we give each project is
                            something a larger operation simply cannot offer.
                        </p>
                        <p className='text-xl text-white/70'>
                            That independence also means we're honest with you from the start.
                            Scope, cost, and timeline are laid out clearly before anything begins —
                            no hidden fees, no vague estimates, no surprises at the invoice stage.
                        </p>
                    </div>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-ui-background-primary'>
                <div className='max-w-300 w-full flex-1 flex flex-col px-6 md:px-8'>
                    <ArtisticFrame className='flex-1 max-h-[65vh] w-full'>
                        <img
                            src={aboutImageTwo}
                            alt='Two designers collaborating with laptops'
                            className='w-full h-full object-cover select-none [-webkit-user-drag:none]'
                        />
                    </ArtisticFrame>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-white'>
                <div className='max-w-260 w-full flex-1 flex flex-col px-6 md:px-8'>
                    <h2 className='text-3xl md:text-4xl font-medium mb-10'>
                        Your site, your ownership
                    </h2>
                    <div className='flex-1 flex flex-col gap-8'>
                        <p className='text-xl'>
                            A website is only useful if you can actually use it. At the end of every
                            project, we hand over your site properly — with documentation, a
                            walkthrough session, and enough time for your questions. The goal is for
                            you to feel fully in control, not reliant on us to make every small
                            change.
                        </p>
                        <p className='text-xl'>
                            That said, we know that not everyone wants to manage their own site —
                            and that's fine too. Ongoing support and updates are available at an
                            agreed rate, so you always have somewhere to turn when things need
                            changing or something needs fixing.
                        </p>
                        <p className='text-xl'>
                            Either way, the choice is yours. We build to hand over, not to keep you
                            dependent.
                        </p>
                    </div>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-white'>
                <div className='max-w-7xl w-full flex-1 flex flex-col px-6 md:px-8'>
                    <h2 className='text-3xl md:text-4xl font-medium mb-10'>What we stand for</h2>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        {valueCards.map((card, index: number) => (
                            <InfoCard key={`${card?.title}-${index}`} {...card} />
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-white px-6 md:px-8'>
                <div className='max-w-260 w-full flex-1 flex flex-col mb-[5vh]'>
                    <h2 className='text-3xl md:text-4xl font-medium mb-10'>We really care</h2>
                    <div className='flex-1 flex flex-col gap-8'>
                        <p className='text-xl'>
                            As a small independent studio, we keep things personal. Your goals guide
                            every decision we make — from the first conversation through to launch.
                        </p>
                        <p className='text-xl'>
                            Every project is built around your needs, with a collaborative process
                            that keeps things clear, focused, and aligned from start to finish.
                        </p>
                        <p className='text-xl'>
                            When we hand things over, you won't be left guessing — you'll be ready
                            to take ownership with confidence.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
