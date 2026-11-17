import { useRouteLoaderData } from 'react-router-dom';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import type { Me } from '../api.ts';
import { AdminMeta } from '../components/AdminMeta.tsx';

/** What the dashboard will show, section by section, as each one is built. */
const SECTIONS = [
    {
        title: 'Deletion requests',
        description: 'Web requests to delete an IJJI Tracker account, with the days left to act.',
    },
    {
        title: 'Supabase',
        description:
            'Users, sign-ups, database health, errors and advisors, for production and develop.',
    },
    {
        title: 'Website',
        description: 'Deploys, form traffic, function health, uptime and Lighthouse scores.',
    },
    {
        title: 'IJJI Tracker',
        description: 'EAS builds and store submissions.',
    },
];

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** The dashboard's home. For now: your session, and the sections still to come. */
export const Overview = () => {
    const me = useRouteLoaderData('admin') as Me;

    return (
        <>
            <AdminMeta title='Overview' />

            <Section tone='light' spacing='md' labelledBy='overview-title'>
                <h1 id='overview-title' className='text-4xl font-extrabold mb-2'>
                    Overview
                </h1>
                <p className='text-neutral-600 mb-10'>
                    Signed in until {timeFormat.format(me.expiresAt)}.
                </p>

                <ul className='grid gap-4 sm:grid-cols-2'>
                    {SECTIONS.map(({ title, description }) => (
                        <li
                            key={title}
                            className='border border-neutral-200 p-6 flex flex-col gap-2'
                        >
                            <h2 className='text-lg font-bold'>{title}</h2>
                            <p className='text-neutral-600'>{description}</p>
                            <p className='text-sm font-semibold text-neutral-600'>Not set up yet</p>
                        </li>
                    ))}
                </ul>
            </Section>
        </>
    );
};
