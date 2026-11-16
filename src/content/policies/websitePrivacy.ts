import { paths } from '../../router/paths.ts';
import { site } from '../site.ts';
import type { PolicyDocument } from '../types.ts';

/** The privacy policy for ijji-labs.com itself. Each app has its own. */
export const websitePrivacy: PolicyDocument = {
    title: 'Website privacy policy',
    summary:
        'How ijji-labs.com handles what you send us. Using one of our apps? Each app has its own privacy policy.',
    effectiveDate: '2026-11-16',
    sections: [
        {
            id: 'in-short',
            heading: 'In short',
            blocks: [
                {
                    type: 'note',
                    text: [
                        'This site sets no cookies and runs no analytics or tracking. The only personal data we get is what you choose to send us through a form, and we use it only to reply.',
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
                        `This website is run by ${site.controller}, the controller of the personal data described here. Contact us at `,
                        { text: site.email, href: `mailto:${site.email}` },
                        '.',
                    ],
                },
            ],
        },
        {
            id: 'what-you-send',
            heading: 'What you send us',
            blocks: [
                {
                    type: 'table',
                    head: ['Form', 'What it asks for', 'Why'],
                    rows: [
                        [
                            [{ text: 'Contact', href: paths.contact }],
                            [
                                'Your name, company, email address, phone number, the kind of project, how you’d like us to reply, how you heard about us, and your message.',
                            ],
                            [
                                'To answer your enquiry and talk about working together. The lawful basis is our legitimate interest in replying, and taking steps you ask for before a contract.',
                            ],
                        ],
                        [
                            [
                                {
                                    text: 'App account deletion',
                                    href: paths.app('ijji-tracker').deleteAccount,
                                },
                            ],
                            [
                                'The email address on your app account, and a reason if you give one.',
                            ],
                            [
                                'To confirm the request with you and delete the account, as data protection law requires.',
                            ],
                        ],
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'Forms are delivered to our inbox as email, through Resend, our email provider, which may process them in the United States under the safeguards UK law requires.',
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
                        'We keep an enquiry for as long as we need to deal with it, and for up to two years afterwards in case you get back in touch, unless we go on to work together, when it becomes part of our project records. Deletion requests are kept for up to a year, to show they were handled.',
                    ],
                },
            ],
        },
        {
            id: 'hosting',
            heading: 'Hosting, cookies and fonts',
            blocks: [
                {
                    type: 'list',
                    items: [
                        [
                            'The site is hosted by Netlify, which keeps short-lived server logs (including IP addresses) to run and protect the service.',
                        ],
                        ['We set no cookies and use no analytics, advertising or tracking tools.'],
                        [
                            'Fonts are served from this site, not from Google or another third party.',
                        ],
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
                    text: [
                        'You can ask for a copy of what we hold about you, ask us to correct or delete it, or object to how we use it. Email ',
                        { text: site.email, href: `mailto:${site.email}` },
                        ' and we’ll answer within one month. You can also complain to the Information Commissioner’s Office at ',
                        { text: 'ico.org.uk', href: 'https://ico.org.uk/make-a-complaint/' },
                        '.',
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
                        'If this policy changes, we’ll update this page and the date at the top.',
                    ],
                },
            ],
        },
    ],
};
