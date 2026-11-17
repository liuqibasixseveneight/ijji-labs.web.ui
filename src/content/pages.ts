import { paths } from '../router/paths.ts';
import { site } from './site.ts';

/** Each page's title and description, for its <title>, search results and link previews. */
export const pageMeta = {
    home: {
        description: site.description,
        path: paths.home,
    },
    about: {
        title: 'About',
        description:
            'ijji labs is a small, independent studio in Leeds designing and building websites with care, craft and purpose, and making apps of its own.',
        path: paths.about,
    },
    services: {
        title: 'Services',
        description:
            'Website design and development from a small studio in Leeds, with a proper handover and optional post-launch support.',
        path: paths.services,
    },
    projects: {
        title: 'Our work',
        description:
            'Recent client projects from ijji labs: different clients, different problems, the same standard of care.',
        path: paths.projects,
    },
    apps: {
        title: 'Apps',
        description:
            'Apps made by ijji labs, starting with IJJI Tracker: a calm, focused way to track the things you work on.',
        path: paths.apps,
    },
    contact: {
        title: 'Contact',
        description: `Tell us about your website project, or ask for help with IJJI Tracker. We reply ${site.replyTime}.`,
        path: paths.contact,
    },
    notFound: {
        title: 'Page not found',
        description: 'The page you were looking for has moved or never existed.',
        path: '/404',
    },
} as const;

export const homeCopy = {
    hero: {
        title: 'Designing websites that work',
        lede: 'Beautiful, user-friendly websites for your business — and a few apps of our own.',
    },
    about: {
        title: 'At ijji labs, we focus on what matters most — the people who use what we make',
        paragraphs: [
            'Founded in Leeds in 2026, ijji labs is an independent studio designing and building fast, modern websites. We work closely with every client, hands-on from the first conversation to launch.',
            'We value simplicity, clarity and performance in everything we make, and we make apps of our own, which keeps us honest about what it takes to build something people use every day.',
        ],
    },
    values: {
        title: 'What we value',
        lede: 'Four principles behind everything we make, for our clients and in our own apps.',
    },
    services: {
        title: 'Our services',
        lede: 'We keep our offering focused — websites, done properly — so every project gets our full attention.',
        note: 'Any additional features can be developed at an agreed extra cost.',
    },
    apps: {
        title: 'Our apps',
        lede: 'Alongside client work, we design, build and run apps of our own.',
    },
    work: {
        title: 'Our work',
        lede: 'A handful of recent projects — different clients, different problems, same standard of care.',
    },
    contact: {
        title: 'Let’s talk',
        lede: 'Tell us about your website, or ask for help with IJJI Tracker, and we’ll get back to you as soon as we can.',
    },
} as const;

export const aboutCopy = {
    hero: {
        title: 'About us',
        lede: 'A small, independent studio from Leeds — building websites with care, craft and purpose, and making apps of our own.',
    },
    story: [
        'Founded in Leeds in 2026, ijji labs is an independent studio dedicated to crafting fast, modern websites. We work closely with every client, taking a hands-on approach to deliver thoughtful, high-quality results that make an impact.',
        'Websites are what we make for our clients, and we love making them. Alongside that, we make apps of our own: the same care for clarity and performance, applied to something people carry in their pocket. IJJI Tracker, our first, is built, released and supported by us.',
        'From concept to launch, we work side by side with our clients, keeping the process clear, collaborative and focused. Once your website is live, we hand it over properly, so you can take ownership with confidence.',
    ],
    independent: [
        'Staying independent is a deliberate choice. It means every project is handled directly — no account managers passing briefs down the chain, no junior teams doing the work while a senior takes the credit. When you work with ijji labs, you work with the people doing the work.',
        'Bigger studios come with bigger overheads, broader processes and a client list wide enough to get lost in. We keep our focus narrow on purpose, so the attention we give each project is something a larger operation simply can’t offer.',
        'Independence also means we’re honest with you from the start. Scope, cost and timeline are laid out clearly before anything begins — no hidden fees, no vague estimates, no surprises at the invoice stage.',
    ],
    ownership: [
        'A website is only useful if you can actually run it. At the end of every project we hand over properly — documentation, a walkthrough session and time for your questions — so you feel in control, not reliant on us for every small change.',
        'Not everyone wants to manage their own site, and that’s fine too. Ongoing support and updates are available at an agreed rate, so you always have somewhere to turn.',
        'Either way, the choice is yours. We build to hand over, not to keep you dependent.',
    ],
    ownApps: [
        'Alongside client websites, we make apps of our own. Running a product ourselves keeps us close to what matters to our clients too: privacy, performance, support emails and keeping things up to date.',
        'It keeps our standards high. Our apps have no ads and no tracking, and we hold client work to the same bar.',
    ],
    care: [
        'As a small independent studio, we keep things personal. Your goals guide every decision we make — from the first conversation through to launch.',
        'Every project is built around your needs, with a collaborative process that keeps things clear, focused and aligned from start to finish.',
        'When we hand things over, you won’t be left guessing — you’ll be ready to take ownership with confidence.',
    ],
} as const;

export const contactCopy = {
    hero: {
        title: 'Let’s talk',
        lede: [
            'Whether you have a clear brief for a website, or just an idea you’re turning over — get in touch. We’re happy to have an honest conversation before anything is committed.',
            'Need help with IJJI Tracker? Choose it as the topic and we’ll take it from there.',
        ],
    },
    expectations: [
        {
            title: `We'll reply ${site.replyTime}`,
            description:
                "You won't be waiting long. Every message gets a personal response — not an automated acknowledgement.",
        },
        {
            title: 'No sales pitch',
            description:
                'Our first response will be questions, not a proposal deck. We want to understand what you need before we talk about anything else.',
        },
        {
            title: 'Honest about fit',
            description:
                "If we're not the right studio for your project, we'll say so. We'd rather point you in the right direction than take on work we can't do justice to.",
        },
    ],
} as const;

/** Page not found: what it says, and the pages it points people to instead. */
export const notFoundCopy = {
    hero: {
        title: 'Page not found',
        lede: [
            'The page you were looking for has moved, or never existed. It might be an old link, or a typo in the address.',
        ],
    },
    nextSteps: {
        title: 'Where to next?',
        lede: 'Most people are looking for one of these.',
        links: [
            {
                title: 'Services',
                description:
                    'Website design and development, with a proper handover and optional support after launch.',
                to: paths.services,
            },
            {
                title: 'Our work',
                description:
                    'Recent client projects: different problems, the same standard of care.',
                to: paths.projects,
            },
            {
                title: 'Apps',
                description: 'Apps of our own, starting with IJJI Tracker.',
                to: paths.apps,
            },
            {
                title: 'About us',
                description: 'A small, independent studio in Leeds, and how we like to work.',
                to: paths.about,
            },
        ],
    },
} as const;
