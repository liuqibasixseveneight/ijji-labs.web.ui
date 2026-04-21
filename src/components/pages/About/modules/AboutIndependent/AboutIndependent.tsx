import { ArtisticFrame } from '../../../../ui';
import { aboutImageTwo } from '../../../../../assets/images';

export const AboutIndependent = () => (
    <>
        <div
            id='why-independent'
            className='flex-1 h-full flex flex-col items-center justify-center w-full py-[6vh] bg-ui-background-primary'
        >
            <div className='max-w-260 w-full flex-1 flex flex-col px-6 md:px-8'>
                <h2 className='text-3xl md:text-4xl font-medium text-white mb-10'>
                    Why independent?
                </h2>
                <div className='flex-1 flex flex-col gap-8'>
                    <p className='text-xl text-white/70'>
                        Staying independent is a deliberate choice. It means every project is
                        handled directly — no account managers passing briefs down the chain, no
                        junior teams doing the work while a senior takes the credit. When you work
                        with ijji labs, you work with the person doing the work.
                    </p>
                    <p className='text-xl text-white/70'>
                        Bigger studios come with bigger overheads, broader processes, and a client
                        list wide enough that you can get lost in it. We keep our focus narrow on
                        purpose — so that the attention we give each project is something a larger
                        operation simply cannot offer.
                    </p>
                    <p className='text-xl text-white/70'>
                        That independence also means we're honest with you from the start. Scope,
                        cost, and timeline are laid out clearly before anything begins — no hidden
                        fees, no vague estimates, no surprises at the invoice stage.
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
    </>
);
