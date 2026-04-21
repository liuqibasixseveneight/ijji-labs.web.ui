import { Button } from '../../../../ui';

export const ServicesCta = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-white'>
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8 items-center'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-ui-background-primary mb-10 leading-none'>
                Ready to start?
            </h2>
            <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-16'>
                Tell us about your project. We'll arrange a short discovery call, then follow up
                with a clear proposal and fixed quote — no obligation.
            </p>
            <Button
                type='internal-link'
                to='/contact'
                label='Get in touch'
                className='self-center'
            />
        </div>
    </div>
);
