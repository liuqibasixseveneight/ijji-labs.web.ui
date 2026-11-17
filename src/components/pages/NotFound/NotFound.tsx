import { Link } from 'react-router-dom';

import { notFoundCopy, pageMeta } from '../../../content';
import { paths } from '../../../router/paths.ts';
import { Button, LinkCard, PageHero, PageMeta, Section, SectionIntro } from '../../ui';

/**
 * Any path that isn't a page: says so, then points to the pages most people are after.
 * Keeps the navbar and footer, so there's always a way on.
 */
export const NotFound = () => {
    const { hero, nextSteps } = notFoundCopy;

    return (
        <>
            <PageMeta {...pageMeta.notFound} noindex />

            <PageHero title={hero.title} lede={[...hero.lede]}>
                <Button
                    type='internal-link'
                    to={paths.contact}
                    label='Get in touch'
                    className='self-start mb-[4vh]'
                />
            </PageHero>

            <Section tone='light' spacing='md' labelledBy='next-steps-title'>
                <SectionIntro
                    id='next-steps-title'
                    title={nextSteps.title}
                    lede={nextSteps.lede}
                    tone='light'
                    size='heading'
                />

                <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 -mt-6'>
                    {nextSteps.links.map((link) => (
                        <li key={link.to}>
                            <LinkCard {...link} />
                        </li>
                    ))}
                </ul>

                <p className='text-lg text-neutral-600 mt-12'>
                    Or start again from the{' '}
                    <Link to={paths.home} className='link-highlight link-marked'>
                        home page
                    </Link>
                    .
                </p>
            </Section>
        </>
    );
};
