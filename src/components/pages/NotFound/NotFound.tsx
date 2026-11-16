import { Button, TextLink } from '../../ui';

/** Any path that isn't a page. Keeps the navbar and footer so there's always a way on. */
export const NotFound = () => (
    <div className='flex-1 h-full flex flex-col items-center justify-center w-full bg-ui-background-primary'>
        <div className='max-w-380 px-6 md:px-8 w-full flex-1 py-[10vh] flex flex-col'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6dvh]'>
                Page not found
            </h1>
            <p className='text-xl text-white/60 max-w-xl mb-10'>
                The page you were looking for has moved or never existed. Try the{' '}
                <TextLink to='/' underline='always' className='text-white'>
                    home page
                </TextLink>
                , or tell us what you were after.
            </p>
            <Button
                type='internal-link'
                to='/contact'
                label='Get in touch'
                className='self-start'
            />
        </div>
    </div>
);
