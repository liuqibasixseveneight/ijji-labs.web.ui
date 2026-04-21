import { Button } from '../../../../ui';

export const ProjectsCTA = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 w-full flex-1 py-[10vh] flex flex-col px-6 md:px-8 items-center'>
            <h2 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-10 leading-none'>
                Got a project in mind?
            </h2>
            <p className='text-lg sm:text-xl text-neutral-600 max-w-2xl leading-relaxed mb-16'>
                We take on a small number of projects at a time — so when we're working with you,
                you have our full attention. If you'd like to talk through what you're looking for,
                we'd love to hear from you.
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
