import { pageMeta } from '../../../content';
import { paths } from '../../../router/paths.ts';
import { Button, PageMeta, Section, TextLink } from '../../ui';

/** Any path that isn't a page. Keeps the navbar and footer so there's always a way on. */
export const NotFound = () => (
    <>
        <PageMeta {...pageMeta.notFound} noindex />

        <Section tone='dark'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 pt-[6svh]'>
                Page not found
            </h1>
            <p className='text-xl text-white/60 max-w-xl mb-10'>
                The page you were looking for has moved or never existed. Try the{' '}
                <TextLink to={paths.home}>home page</TextLink>, or tell us what you were after.
            </p>
            <Button
                type='internal-link'
                to={paths.contact}
                label='Get in touch'
                className='self-start'
            />
        </Section>
    </>
);
