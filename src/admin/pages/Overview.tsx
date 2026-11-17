import { Link, useRouteLoaderData } from 'react-router-dom';
import { clsx } from 'clsx';

import { Section } from '../../components/ui/atoms/Section/Section.tsx';
import { AdminMeta } from '../components/AdminMeta.tsx';
import { daysLeft, describeDaysLeft, OPEN, urgency } from '../deletionRequests.ts';
import { adminPaths } from '../paths.ts';
import type { AdminData } from '../routes.tsx';

/** The sections still to come, as each step of the dashboard is built. */
const COMING = [
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

const card = 'border border-neutral-200 p-6 flex flex-col gap-2 h-full';

/** Deletion requests at a glance: how many are open, and how long the next one has. */
const DeletionRequestsCard = () => {
    const { deletions } = useRouteLoaderData('admin') as AdminData;
    const open = deletions?.requests.filter((r) => OPEN.includes(r.status)) ?? [];
    const next = open.length ? Math.min(...open.map((r) => daysLeft(r, deletions!.now))) : null;

    return (
        <Link
            to={adminPaths.deletionRequests}
            className={clsx(
                card,
                'hover:bg-neutral-50',
                next !== null && urgency(next) === 'urgent' && 'border-red-300 bg-red-50',
            )}
        >
            <h2 className='text-lg font-bold'>Deletion requests</h2>
            {!deletions ? (
                <p className='text-neutral-600'>Couldn’t load them. Open the page to try again.</p>
            ) : (
                <>
                    <p className='text-3xl font-extrabold'>{open.length} open</p>
                    <p className='text-neutral-600'>
                        {next === null
                            ? 'Nothing to do.'
                            : `The next: ${describeDaysLeft(next).toLowerCase()}.`}
                    </p>
                </>
            )}
        </Link>
    );
};

/** The dashboard's home: what needs doing, and the sections still to come. */
export const Overview = () => {
    const { me } = useRouteLoaderData('admin') as AdminData;

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
                    <li>
                        <DeletionRequestsCard />
                    </li>
                    {COMING.map(({ title, description }) => (
                        <li key={title} className={card}>
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
