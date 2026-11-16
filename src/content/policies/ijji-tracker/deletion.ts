import { paths } from '../../../router/paths.ts';
import { site } from '../../site.ts';
import type { PolicyDocument } from '../../types.ts';

/**
 * How to delete an IJJI Tracker account: Google Play's account-deletion URL. The page
 * shows the request form after the `without-the-app` section.
 */
export const ijjiTrackerDeletion: PolicyDocument = {
    title: 'Delete your IJJI Tracker account',
    summary:
        'You can delete your account in the app in a few taps. If you no longer have the app, ask us here and we’ll do it for you.',
    effectiveDate: '2026-11-16',
    sections: [
        {
            id: 'in-the-app',
            heading: 'In the app',
            blocks: [
                {
                    type: 'list',
                    items: [
                        ['Open IJJI Tracker and go to Profile.'],
                        ['Tap Settings, then Delete account at the bottom.'],
                        [
                            'Read what will be deleted, tap Delete my account and confirm. It happens straight away.',
                        ],
                    ],
                },
            ],
        },
        {
            id: 'without-the-app',
            heading: 'Without the app',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        `Send the form below with the email address you signed up with. We’ll email that address from ${site.email} to check the request is really from you, then delete the account ${site.deletionTime} and let you know when it’s done.`,
                    ],
                },
            ],
        },
        {
            id: 'what-gets-deleted',
            heading: 'What gets deleted',
            blocks: [
                {
                    type: 'list',
                    items: [
                        ['Your account: email address, password, name and avatar.'],
                        ['Everything you tracked: activities, goals, sessions and notes.'],
                        [
                            'In the app, also what your phone kept: preferences, reminders and any session still running. Deleting the app removes these too.',
                        ],
                    ],
                },
            ],
        },
        {
            id: 'what-we-keep',
            heading: 'What we keep',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'Nothing from the account itself. Copies in our provider’s encrypted backups are overwritten as the backups roll over, ',
                        site.backupRetention,
                        '. We keep our email exchange about your request for up to a year, to show it was handled. The ',
                        {
                            text: 'privacy policy',
                            href: paths.app('ijji-tracker').privacy,
                        },
                        ' has more on how long we keep things.',
                    ],
                },
            ],
        },
    ],
};
