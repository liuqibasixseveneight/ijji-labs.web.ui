import { contactAbout, paths } from '../../../router/paths.ts';
import { site } from '../../site.ts';
import type { PolicyDocument } from '../../types.ts';

const app = paths.app('ijji-tracker');

/** IJJI Tracker's support page: Apple's support URL. Answers use the app's own labels. */
export const ijjiTrackerSupport: PolicyDocument = {
    title: 'IJJI Tracker support',
    summary: `Answers to the questions we hear most, and how to reach us. We reply ${site.replyTime}.`,
    effectiveDate: '2026-11-25',
    sections: [
        {
            id: 'contact',
            heading: 'Get in touch',
            blocks: [
                {
                    type: 'paragraph',
                    text: [
                        'Email ',
                        { text: site.email, href: `mailto:${site.email}` },
                        ' or ',
                        { text: 'send us a message', href: contactAbout('support') },
                        `. We reply ${site.replyTime}. It helps to tell us your phone model, its iOS or Android version, and the email address on your account (never your password).`,
                    ],
                },
            ],
        },
        {
            id: 'signing-in',
            heading: 'Signing in',
            blocks: [],
            faqs: [
                {
                    question: 'The link in my email doesn’t sign me in',
                    answer: [
                        'Email links only work on the phone that asked for them, so open the email on that phone. If you opened a confirmation link somewhere else, your email is still confirmed: log in with your email and password.',
                    ],
                },
                {
                    question: 'It says the link has expired',
                    answer: [
                        'Links work once, and a password reset link for an hour. Some work email systems open every link to check it first, which uses it up. Ask for a new one from Log In.',
                    ],
                },
                {
                    question: 'I’ve forgotten my password',
                    answer: [
                        'On Log In, tap Forgot password?, then open the link we email you on the same phone within an hour. Can’t see it? Check your spam folder.',
                    ],
                },
                {
                    question: 'How do I change my password?',
                    answer: [
                        'Profile → Settings → Change password. You’ll need your current password.',
                    ],
                },
            ],
        },
        {
            id: 'using-the-app',
            heading: 'Using the app',
            blocks: [],
            faqs: [
                {
                    question: 'My reminders don’t arrive',
                    answer: [
                        'Check notifications are allowed for IJJI Tracker in your phone’s settings. Reminders are scheduled on your phone itself, so they stay on that phone and stop if you delete the app.',
                    ],
                },
                {
                    question: 'Will my sessions move to a new phone?',
                    answer: [
                        'Yes. Sign in on the new phone and your activities, sessions and weekly target are there. Reminders and display preferences live on each phone, so set those up again.',
                    ],
                },
                {
                    question: 'Can I get my data out?',
                    answer: [
                        'Profile → Settings → Export your data saves your sessions as a spreadsheet (CSV) you can share or keep.',
                    ],
                },
            ],
        },
        {
            id: 'your-account',
            heading: 'Your account and privacy',
            blocks: [],
            faqs: [
                {
                    question: 'How do I delete my account?',
                    answer: [
                        'Profile → Settings → Delete account removes it straight away. No longer have the app? ',
                        { text: 'Ask us to delete it', href: app.deleteAccount },
                        '.',
                    ],
                },
                {
                    question: 'What do you keep about me?',
                    answer: [
                        'Only your account details and what you track, to run the app for you. No ads, analytics or tracking. The ',
                        { text: 'privacy policy', href: app.privacy },
                        ' has the details.',
                    ],
                },
            ],
        },
    ],
};
