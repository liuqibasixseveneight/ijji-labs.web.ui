import { paths } from '../../../router/paths.ts';
import { site } from '../../site.ts';
import type { PolicyDocument } from '../../types.ts';

const app = paths.app('ijji-tracker');

/** IJJI Tracker's terms of use. A plain-English draft: have it reviewed before release. */
export const ijjiTrackerTerms: PolicyDocument = {
    title: 'IJJI Tracker terms of use',
    summary:
        'The agreement between you and ijji labs when you use IJJI Tracker. Please read it with our privacy policy.',
    effectiveDate: '2026-11-16',
    sections: [
        {
            id: 'about',
            heading: 'About these terms',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        `IJJI Tracker is made by ${site.controller} (“we”, “us”). By creating an account or using the app, you agree to these terms and to our `,
                        { text: 'privacy policy', href: app.privacy },
                        '. If you don’t agree, please don’t use the app.',
                    ],
                },
            ],
        },
        {
            id: 'who-can-use-it',
            heading: 'Who can use it',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'You must be 16 or over. You need an email address you can receive mail at, and you’re responsible for keeping your password to yourself. Tell us straight away if you think someone else has used your account.',
                    ],
                },
            ],
        },
        {
            id: 'your-licence',
            heading: 'Using the app',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'We give you a personal, non-exclusive, non-transferable licence to use IJJI Tracker on devices you own or control, for your own use. The app store you got it from also has terms that apply to your download.',
                    ],
                },
                { type: 'paragraph', text: ['Please don’t:'] },
                {
                    type: 'list',
                    items: [
                        [
                            'copy, change, sell or reverse-engineer the app, except as the law allows;',
                        ],
                        [
                            'try to get into other people’s accounts or data, or test, overload or disrupt our systems;',
                        ],
                        ['use the app for anything unlawful, or to store unlawful content.'],
                    ],
                },
            ],
        },
        {
            id: 'your-content',
            heading: 'Your content',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'What you record in the app (activities, sessions and notes) is yours. You let us store and process it only to run the app for you, as the privacy policy describes. You can export it or delete it whenever you like.',
                    ],
                },
            ],
        },
        {
            id: 'availability',
            heading: 'Changes and availability',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'We work to keep IJJI Tracker running smoothly, but we can’t promise it will always be available or free of errors. We may change, add or remove features, and we’ll give reasonable notice of anything that significantly affects you. If we ever introduce paid features, we’ll set out their terms before you pay anything.',
                    ],
                },
            ],
        },
        {
            id: 'ending',
            heading: 'Ending your account',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'You can stop using the app and delete your account at any time (Profile → Settings → Delete account, or ',
                        { text: 'on our website', href: app.deleteAccount },
                        '). We may suspend or close an account that seriously or repeatedly breaks these terms, and we’ll tell you why unless the law stops us.',
                    ],
                },
            ],
        },
        {
            id: 'liability',
            heading: 'Our responsibility to you',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'IJJI Tracker helps you keep track of your time; it isn’t professional, medical or financial advice. We’re responsible for loss you suffer that is a foreseeable result of us breaking these terms or failing to use reasonable care and skill. We’re not responsible for loss that wasn’t foreseeable, or for business losses: the app is for personal use.',
                    ],
                },
                {
                    type: 'paragraph',
                    text: [
                        'Nothing in these terms limits our liability where the law doesn’t allow it, including for death or personal injury caused by our negligence, for fraud, or your rights as a consumer under UK law.',
                    ],
                },
            ],
        },
        {
            id: 'apple',
            heading: 'If you got the app from the App Store',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'These terms are between you and us, not Apple. Apple has no obligation to provide support or maintenance for the app, and isn’t responsible for any claims about it, including product liability, legal or regulatory claims, or claims that it infringes someone’s rights. If the app fails to meet any warranty that applies, you may tell Apple, who may refund its purchase price (if any); Apple has no other warranty obligation. Apple and its subsidiaries are third-party beneficiaries of these terms and may enforce them against you.',
                    ],
                },
            ],
        },
        {
            id: 'law',
            heading: 'The law that applies',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'These terms are governed by the law of England and Wales, and the courts of England and Wales can hear disputes. If you live in Scotland or Northern Ireland, you can also bring proceedings there.',
                    ],
                },
            ],
        },
        {
            id: 'contact',
            heading: 'Contact',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'Questions about these terms: ',
                        { text: site.email, href: `mailto:${site.email}` },
                        '.',
                    ],
                },
            ],
        },
    ],
};
