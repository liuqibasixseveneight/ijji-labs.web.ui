import { ijjiTrackerDeletion } from './policies/ijji-tracker/deletion.ts';
import { ijjiTrackerPrivacy } from './policies/ijji-tracker/privacy.ts';
import { ijjiTrackerSupport } from './policies/ijji-tracker/support.ts';
import { ijjiTrackerTerms } from './policies/ijji-tracker/terms.ts';
import type { AppEntry } from './types.ts';

/**
 * Our own apps. Each gets a page at /apps/<slug> and four policy pages under it; adding
 * an app here is all it takes. Store links go in `platforms` when an app is live.
 *
 * IJJI Tracker's copy follows the app's own language: it's about tracking activities and
 * focus sessions, never "studying" (a test checks).
 */
export const apps: AppEntry[] = [
    {
        slug: 'ijji-tracker',
        name: 'IJJI Tracker',
        tagline: 'See where your time really goes.',
        summary:
            'IJJI Tracker is a calm, focused way to track the things you work on. Start a focus session, run it as a timer or in Pomodoro rounds, and watch your hours add up towards the goals you set.',
        description:
            'Track focus sessions, weekly goals and progress for everything you work on. No ads, no tracking. For iPhone and Android, coming soon.',
        features: [
            {
                title: 'Focus sessions',
                description:
                    'Start a session on anything you’re working on, as an open timer or in Pomodoro rounds, and add a note when you finish.',
            },
            {
                title: 'Activities your way',
                description:
                    'Give each activity its own icon and colour, so your week reads at a glance.',
            },
            {
                title: 'Weekly goals',
                description:
                    'Set how much time you want to give an activity each week, and see it fill as you go.',
            },
            {
                title: 'Reminders',
                description:
                    'A nudge to start, on the days and at the times that suit you. Set on your phone, with nothing sent from a server.',
            },
            {
                title: 'Weeks on target',
                description:
                    'Choose how many days a week you want to show up. Personal bests and achievements reward the habit, and a missed week never takes one away.',
            },
            {
                title: 'Your data, yours',
                description:
                    'No ads and no tracking. Export your sessions as a spreadsheet, or delete everything, whenever you like.',
            },
        ],
        platforms: { ios: 'coming-soon', android: 'coming-soon' },
        bundleId: 'com.ijjilabs.tracker',
        minimumAge: 16,
        policies: {
            privacy: ijjiTrackerPrivacy,
            terms: ijjiTrackerTerms,
            support: ijjiTrackerSupport,
            deletion: ijjiTrackerDeletion,
        },
    },
];

export const findApp = (slug: string | undefined) => apps.find((app) => app.slug === slug);
