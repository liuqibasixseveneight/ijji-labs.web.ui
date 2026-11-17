import { TextLink } from '../../components/ui/atoms/TextLink/TextLink.tsx';
import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';

/** An admin address that isn't a page. */
export const AdminNotFound = () => (
    <>
        <AdminMeta title='Page not found' />

        <Section tone='light' spacing='md' labelledBy='not-found-title'>
            <h1 id='not-found-title' className='text-4xl font-extrabold mb-4'>
                Page not found
            </h1>
            <p className='text-neutral-600'>
                There’s no admin page here. Back to the{' '}
                <TextLink to='/' tone='light'>
                    overview
                </TextLink>
                .
            </p>
        </Section>
    </>
);
