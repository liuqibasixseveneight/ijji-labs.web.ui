import { paths } from '../../../router/paths.ts';
import { site } from '../../site.ts';
import type { PolicyDocument } from '../../types.ts';

/**
 * IJJI Tracker's privacy policy, linked from App Store Connect and the Play Console.
 *
 * Written from what the app actually does (ijji-tracker.mobile: docs/SECURITY.md and the
 * Supabase migrations). When the app starts collecting something new, or friends and
 * classrooms ship (they are behind developer flags today), update this in the same release
 * and move `effectiveDate`.
 */
export const ijjiTrackerPrivacy: PolicyDocument = {
    title: 'IJJI Tracker privacy policy',
    summary:
        'What IJJI Tracker keeps about you, why, where, for how long, and how to see it, take it with you or delete it.',
    effectiveDate: '2026-11-17',
    sections: [
        {
            id: 'in-short',
            heading: 'In short',
            blocks: [
                {
                    type: 'note',
                    text: [
                        'IJJI Tracker keeps your account details and the sessions you record, so it can show your history, goals and progress. Nothing else. There are no ads, no analytics and no tracking, and we never sell or share your data. You can export it or delete it at any time.',
                    ],
                },
            ],
        },
        {
            id: 'who-we-are',
            heading: 'Who we are',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        `IJJI Tracker is made by ${site.controller}. We decide how your data in the app is used, which makes us its controller under UK data protection law (UK GDPR and the Data Protection Act 2018).`,
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'Questions about this policy or your data go to ',
                        { text: site.email, href: `mailto:${site.email}` },
                        '.',
                    ],
                },
            ],
        },
        {
            id: 'what-we-keep',
            heading: 'What we keep, and why',
            blocks: [
                {
                    type: 'table',
                    head: ['What', 'For example', 'Why'],
                    rows: [
                        [
                            [{ strong: 'Your account' }],
                            [
                                'Your email address and password, the name you choose, and your avatar (an emoji and a colour). Your password is stored as a secure hash by our sign-in provider; we never see it.',
                            ],
                            ['To create your account, sign you in and show your profile.'],
                        ],
                        [
                            [{ strong: 'What you track' }],
                            [
                                'Your activities (name, icon, colour and any weekly goal) and your sessions (when they started and ended, how long they ran, Pomodoro rounds and any notes you add).',
                            ],
                            [
                                'To keep your history and show your totals, goals, streaks and achievements, on any phone you sign in on.',
                            ],
                        ],
                        [
                            [{ strong: 'Account emails' }],
                            [
                                'The confirmation email when you sign up, and password reset emails when you ask for one.',
                            ],
                            ['To check the email address is yours, and to help you back in.'],
                        ],
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'We use this only to run the app for you: the lawful basis is that it is needed to provide the service you signed up for. We also limit repeated failed attempts to protect accounts, which is in our and your legitimate interest in keeping the app secure.',
                    ],
                },
            ],
        },
        {
            id: 'on-your-phone',
            heading: 'What stays on your phone',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'Some things never leave your phone: your preferences (such as 12 or 24-hour time), your reminders, and a session that is still running. Reminders are notifications your phone schedules itself, so we never receive a push token or send you notifications from a server.',
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        "To keep you signed in, the app stores your login on your phone, encrypted with a key held in your phone's secure storage (the iOS Keychain or Android Keystore). On Android, the app's data is left out of device backups.",
                    ],
                },
            ],
        },
        {
            id: 'what-we-dont-do',
            heading: 'What we don’t do',
            blocks: [
                {
                    type: 'list',
                    items: [
                        ['No advertising, and no analytics or tracking tools in the app.'],
                        [
                            'No tracking you across other apps or websites, and no sharing with data brokers.',
                        ],
                        ['We never sell your data, or share it for anyone’s marketing.'],
                        [
                            'The app doesn’t ask for your location, contacts, photos, camera, microphone or health data.',
                        ],
                    ],
                },
            ],
        },
        {
            id: 'who-helps',
            heading: 'Who helps us run the app',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'A few providers process data on our behalf, only to run the app, and under contracts that require them to protect it:',
                    ],
                },
                {
                    type: 'table',
                    head: ['Provider', 'What they do', 'Where'],
                    rows: [
                        [
                            ['Supabase'],
                            ['Hosts the database and handles sign-in.'],
                            ['Ireland (European Union)'],
                        ],
                        [
                            ['Netlify'],
                            [
                                'Hosts our website, and keeps requests to delete an account sent through it until they’re dealt with.',
                            ],
                            ['Frankfurt, Germany (European Union)'],
                        ],
                        [
                            ['Resend'],
                            ['Sends the account emails (confirmation and password reset).'],
                            ['May process email data in the United States'],
                        ],
                        [
                            ['Apple and Google'],
                            [
                                'Distribute the app through the App Store and Google Play, under their own privacy policies.',
                            ],
                            ['Worldwide'],
                        ],
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'Where a provider handles data outside the UK, we rely on the safeguards UK law requires, such as the UK International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses.',
                    ],
                },
            ],
        },
        {
            id: 'how-long',
            heading: 'How long we keep it',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'We keep your data for as long as you have an account. When you delete your account, your account, profile, activities and sessions are removed from our database straight away. If our database provider holds encrypted backups, any copy in them is deleted when those backups expire, and we never restore a deleted account from them.',
                    ],
                },
            ],
        },
        {
            id: 'security',
            heading: 'Keeping it safe',
            blocks: [
                {
                    type: 'list',
                    items: [
                        ['Everything between the app and our servers travels encrypted (HTTPS).'],
                        ['The database only lets each person read and change their own records.'],
                        [
                            'Your login on the phone is encrypted, and email links only work on the phone that asked for them.',
                        ],
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'No system is perfectly secure, but if something ever went wrong that put your data at risk, we would tell you and the Information Commissioner’s Office as the law requires.',
                    ],
                },
            ],
        },
        {
            id: 'your-rights',
            heading: 'Your rights',
            blocks: [
                {
                    type: 'paragraph',
                    text: ['You can, at any time:'],
                },
                {
                    type: 'list',
                    items: [
                        [
                            { strong: 'See and correct it' },
                            ': your name, avatar, activities and sessions can be changed in the app, and you can ask us for a copy of everything we hold.',
                        ],
                        [
                            { strong: 'Take it with you' },
                            ': Profile → Settings → Export your data saves your sessions as a spreadsheet (CSV).',
                        ],
                        [
                            { strong: 'Delete it' },
                            ': Profile → Settings → Delete account, or ',
                            {
                                text: 'ask us to delete it',
                                href: paths.app('ijji-tracker').deleteAccount,
                            },
                            ' if you no longer have the app.',
                        ],
                        [
                            { strong: 'Object or ask us to restrict' },
                            ' how we use your data, where the law allows.',
                        ],
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'Email ',
                        { text: site.email, href: `mailto:${site.email}` },
                        ' and we’ll answer within one month. If you’re unhappy with how we’ve handled your data, you can complain to the Information Commissioner’s Office at ',
                        { text: 'ico.org.uk', href: 'https://ico.org.uk/make-a-complaint/' },
                        '.',
                    ],
                },
            ],
        },
        {
            id: 'age',
            heading: 'Age',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'IJJI Tracker is for people aged 16 and over. If we learn that someone younger has an account, we’ll delete it.',
                    ],
                },
            ],
        },
        {
            id: 'changes',
            heading: 'Changes to this policy',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'If we change what we collect or how we use it, we’ll update this page and the date at the top. For important changes, we’ll also tell you in the app or by email before they take effect.',
                    ],
                },
            ],
        },
    ],
};
