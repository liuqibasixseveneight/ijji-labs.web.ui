/**
 * The ijji labs site map: every page, how people reach it, what can be clicked
 * on it and where that leads. index.html draws it; open that file in a browser.
 *
 * Keep it in step with the site: when a route is added, moved or removed, or a
 * page gains, loses or changes a link, update it here.
 * __tests__/screenMap.test.ts fails if a route in src/router/routes.tsx has no
 * screen here, a screen points at a route that's gone, a link names a screen
 * that isn't on the map, or the menu and footer here differ from the site's.
 *
 * A screen: `id`, `col` (a column id), `title`, `route` (as shown), `how` it
 * opens, `note`, optional `inside` (what changes on the same page), `exits`
 * and, for screens that are routes, `path` (as in routes.tsx: '/', '/about',
 * '/apps/:appSlug/privacy', '*' for the catch-all). `outside` marks a way in
 * from outside the site, `dot` the colour of its "how" dot.
 * An exit: `tap` (exactly what the visitor clicks, using the on-screen copy;
 * the footer's legal links are written `group: link`), `kind` (page, jump,
 * menu, submit, inplace, auto or external), optional `to` (a screen id) and
 * `note`.
 */
window.SCREEN_MAP = {
    columns: [
        { id: 'outside', title: 'Ways in', sub: 'Search, links and the app stores' },
        { id: 'chrome', title: 'On every page', sub: 'Navbar, menu and footer' },
        { id: 'pages', title: 'Pages', sub: 'The studio and its apps' },
        { id: 'legal', title: 'Policies', sub: 'Linked from the stores; URLs never change' },
        { id: 'results', title: 'After sending', sub: 'What the forms show' },
    ],

    screens: [
        // Ways in
        {
            id: 'search',
            col: 'outside',
            outside: true,
            title: 'Search or a shared link',
            route: 'https://www.ijji-labs.com/…',
            how: 'Arrives from outside',
            note: 'Every page is pre-rendered at build time, so the first thing anyone sees is real HTML, even before JavaScript loads. Any other address gets 404.html with a real 404 status.',
            exits: [
                { tap: 'Lands on the home page', to: 'home', kind: 'auto' },
                {
                    tap: 'Lands on a deep link',
                    to: 'services',
                    kind: 'auto',
                    note: 'Or any other page; sitemap.xml lists them all.',
                },
                { tap: 'Follows a broken or old link', to: 'not-found', kind: 'auto' },
            ],
        },
        {
            id: 'app-store',
            col: 'outside',
            outside: true,
            title: 'App Store listing',
            route: 'apps.apple.com/…',
            how: 'Apple’s listing for IJJI Tracker',
            note: 'App Store Connect asks for a privacy policy URL and a support URL. Coming soon: the listing isn’t live yet.',
            exits: [
                { tap: 'Privacy Policy', to: 'tracker-privacy', kind: 'external' },
                { tap: 'App Support', to: 'tracker-support', kind: 'external' },
            ],
        },
        {
            id: 'google-play',
            col: 'outside',
            outside: true,
            title: 'Google Play listing',
            route: 'play.google.com/…',
            how: 'Google’s listing for IJJI Tracker',
            note: 'The Play Console asks for a privacy policy URL and a web page for deleting an account without the app.',
            exits: [
                { tap: 'Privacy policy', to: 'tracker-privacy', kind: 'external' },
                { tap: 'Delete account (Data safety)', to: 'tracker-deletion', kind: 'external' },
            ],
        },

        // On every page
        {
            id: 'navbar',
            col: 'chrome',
            title: 'Navbar',
            route: 'Top of every page',
            how: 'Always there, sticky',
            note: 'See-through at the top of every page, showing the page behind it, and dark once it scrolls (on Home, once the gradient hero has mostly gone by). Get in touch is in the navbar from 360px wide up (smaller on phones); below that it’s in the menu.',
            exits: [
                { tap: 'ijji labs (logo)', to: 'home', kind: 'page' },
                { tap: 'Get in touch', to: 'contact', kind: 'page' },
                { tap: 'Hamburger (Open menu)', to: 'menu', kind: 'menu' },
            ],
        },
        {
            id: 'menu',
            col: 'chrome',
            title: 'Menu',
            route: 'Full screen, slides in from the left',
            how: 'Hamburger in the navbar',
            note: 'Opening it moves focus to its first link and locks the page’s scroll. While closed it is inert, so its links are out of the tab order.',
            inside: [
                'The page you’re on is yellow, marked “You’re here”, with its number behind (tablet and up)',
                'Hovering an item rolls its name to yellow, sweeps a yellow line under it and shows its number behind',
                'The studio’s email and location at the foot',
            ],
            exits: [
                { tap: '00 Home — Welcome', to: 'home', kind: 'page' },
                { tap: '01 About — Who we are', to: 'about', kind: 'page' },
                { tap: '02 Services — What we do', to: 'services', kind: 'page' },
                { tap: '03 Projects — Our work', to: 'projects', kind: 'page' },
                { tap: '04 Apps — What we make', to: 'apps', kind: 'page' },
                { tap: '05 Contact — Say hello', to: 'contact', kind: 'page' },
                {
                    tap: 'Hamburger again, or Esc',
                    to: 'navbar',
                    kind: 'menu',
                    note: 'Esc puts focus back on the hamburger.',
                },
            ],
        },
        {
            id: 'footer',
            col: 'chrome',
            title: 'Footer',
            route: 'Bottom of every page',
            how: 'Always there',
            note: 'Opens with an invitation: “Have a website in mind?”, the reply time, and the studio’s email (a mailto link). Then one row of columns, each with the same heading and link style: the logo, tagline and location; Studio (the main links); ijji labs (website privacy); and each app (privacy, terms, support, delete account), so a reviewer can find the policies from any page. Last, the copyright and Back to top (scrolls up and moves focus to the page). The current page’s link stays yellow.',
            exits: [
                { tap: 'ijji labs (logo)', to: 'home', kind: 'page' },
                { tap: 'About', to: 'about', kind: 'page' },
                { tap: 'Services', to: 'services', kind: 'page' },
                { tap: 'Projects', to: 'projects', kind: 'page' },
                { tap: 'Apps', to: 'apps', kind: 'page' },
                { tap: 'Contact', to: 'contact', kind: 'page' },
                { tap: 'ijji labs: Privacy', to: 'website-privacy', kind: 'page' },
                { tap: 'IJJI Tracker: Privacy', to: 'tracker-privacy', kind: 'page' },
                { tap: 'IJJI Tracker: Terms', to: 'tracker-terms', kind: 'page' },
                { tap: 'IJJI Tracker: Support', to: 'tracker-support', kind: 'page' },
                { tap: 'IJJI Tracker: Delete account', to: 'tracker-deletion', kind: 'page' },
            ],
        },

        // Pages
        {
            id: 'home',
            col: 'pages',
            path: '/',
            title: 'Home',
            route: '/',
            how: 'Logo, Home in the menu',
            dot: '#FAEE47',
            note: 'The gradient hero, About us, Our services, Our process, Our apps (IJJI Tracker), Our work and Let’s talk with the contact form. Every section has a way on to the page that covers it in full.',
            inside: [
                'Palette picker, bottom right of the hero: three light and three dark gradients. A dark one turns the hero text, logo and hamburger white.',
                'three.js loads only when the hero starts; no other page downloads it.',
            ],
            exits: [
                { tap: 'More about us', to: 'about', kind: 'page' },
                { tap: 'All services', to: 'services', kind: 'page' },
                { tap: 'See IJJI Tracker', to: 'app', kind: 'page' },
                { tap: 'See our apps', to: 'apps', kind: 'page' },
                { tap: 'All projects', to: 'projects', kind: 'page' },
                { tap: 'A palette swatch', kind: 'inplace' },
                { tap: 'Send message (the form at the bottom)', to: 'sent', kind: 'submit' },
                { tap: 'Send message, when sending fails', to: 'send-failed', kind: 'submit' },
            ],
        },
        {
            id: 'about',
            col: 'pages',
            path: '/about',
            title: 'About',
            route: '/about',
            how: 'Menu, footer, More about us',
            dot: '#FAEE47',
            note: 'Our story, Why independent?, Your ownership, Our own apps, What we stand for, We really care, then Got something in mind?',
            exits: [
                { tap: 'Our story', kind: 'jump' },
                { tap: 'Why independent?', kind: 'jump' },
                { tap: 'Your ownership', kind: 'jump' },
                { tap: 'Our own apps', kind: 'jump' },
                { tap: 'What we stand for', kind: 'jump' },
                { tap: 'See our apps', to: 'apps', kind: 'page' },
                {
                    tap: 'Get in touch (Got something in mind?)',
                    to: 'contact',
                    kind: 'page',
                    note: 'Opens with a new website chosen as the topic.',
                },
            ],
        },
        {
            id: 'services',
            col: 'pages',
            path: '/services',
            title: 'Services',
            route: '/services',
            how: 'Menu, footer, All services',
            dot: '#FAEE47',
            note: 'Websites, Handover & Training and Post-Launch Support in detail, Our process, the FAQ and Ready to start?',
            inside: ['FAQ: one answer open at a time'],
            exits: [
                { tap: 'Websites', kind: 'jump' },
                { tap: 'Handover & Training', kind: 'jump' },
                { tap: 'Post-Launch Support', kind: 'jump' },
                { tap: 'FAQ', kind: 'jump' },
                { tap: 'A question in the FAQ', kind: 'inplace' },
                { tap: 'just ask (under FAQ)', to: 'contact', kind: 'page' },
                { tap: 'Get in touch (Ready to start?)', to: 'contact', kind: 'page' },
            ],
        },
        {
            id: 'projects',
            col: 'pages',
            path: '/projects',
            title: 'Projects',
            route: '/projects',
            how: 'Menu, footer, All projects',
            dot: '#FAEE47',
            note: 'Client work: three projects, Our process (as Our approach) and Got a project in mind?',
            exits: [
                { tap: 'CluedIn', kind: 'jump' },
                { tap: 'Dedalus', kind: 'jump' },
                { tap: 'DXC Technology', kind: 'jump' },
                { tap: 'Our approach', kind: 'jump' },
                { tap: 'And the apps we make ourselves', to: 'apps', kind: 'page' },
                { tap: 'Get in touch (Got a project in mind?)', to: 'contact', kind: 'page' },
            ],
        },
        {
            id: 'apps',
            col: 'pages',
            path: '/apps',
            title: 'Apps',
            route: '/apps',
            how: 'Menu, footer, See our apps',
            dot: '#FAEE47',
            note: 'Our own apps, one card each with where to get it (Coming soon until it’s live), then Need help with IJJI Tracker?',
            exits: [
                { tap: 'See IJJI Tracker', to: 'app', kind: 'page' },
                {
                    tap: 'Ask for help',
                    to: 'contact',
                    kind: 'page',
                    note: 'Opens with Help with IJJI Tracker chosen as the topic.',
                },
            ],
        },
        {
            id: 'app',
            col: 'pages',
            path: '/apps/:appSlug',
            title: 'IJJI Tracker',
            route: '/apps/ijji-tracker',
            how: 'See IJJI Tracker, breadcrumb',
            dot: '#FAEE47',
            note: 'What it does, where to get it, and Privacy and support with its four policy pages. Built from src/content/apps.ts: a new app there gets its own copy of this page and the four below.',
            exits: [
                { tap: 'What it does', kind: 'jump' },
                { tap: 'Privacy and support', kind: 'jump' },
                { tap: 'Privacy policy', to: 'tracker-privacy', kind: 'page' },
                { tap: 'Terms of use', to: 'tracker-terms', kind: 'page' },
                { tap: 'Support', to: 'tracker-support', kind: 'page' },
                { tap: 'Delete your account', to: 'tracker-deletion', kind: 'page' },
                {
                    tap: 'Get support (Questions about IJJI Tracker?)',
                    to: 'tracker-support',
                    kind: 'page',
                },
                {
                    tap: 'App Store / Google Play badge',
                    kind: 'external',
                    note: 'Shows Coming soon until the store links go into apps.ts.',
                },
            ],
        },
        {
            id: 'contact',
            col: 'pages',
            path: '/contact',
            title: 'Contact',
            route: '/contact?topic=…',
            how: 'Get in touch, Contact, just ask',
            dot: '#FAEE47',
            note: 'Let’s talk, the contact form and what to expect, including “We’ll reply within one business day”. ?topic=support or website chooses the form’s topic.',
            inside: [
                'Submitting with gaps shows what each field needs, without sending',
                'Help with IJJI Tracker as the topic: no phone number needed',
            ],
            exits: [
                { tap: 'Send message', to: 'sent', kind: 'submit' },
                { tap: 'Send message, when sending fails', to: 'send-failed', kind: 'submit' },
            ],
        },
        {
            id: 'not-found',
            col: 'pages',
            path: '*',
            title: 'Page not found',
            route: 'Any other path',
            how: 'A mistyped or old address, or an app that doesn’t exist',
            note: 'Keeps the navbar and footer, so there is always a way on. Where to next? offers four pages as cards, and the home page in the text below them. Marked noindex.',
            exits: [
                { tap: 'Get in touch', to: 'contact', kind: 'page' },
                { tap: 'Services card', to: 'services', kind: 'page' },
                { tap: 'Our work card', to: 'projects', kind: 'page' },
                { tap: 'Apps card', to: 'apps', kind: 'page' },
                { tap: 'About us card', to: 'about', kind: 'page' },
                { tap: 'home page', to: 'home', kind: 'page' },
            ],
        },

        // Policies
        {
            id: 'tracker-privacy',
            col: 'legal',
            path: '/apps/:appSlug/privacy',
            title: 'IJJI Tracker privacy policy',
            route: '/apps/ijji-tracker/privacy',
            how: 'Both stores, the app page, the footer',
            note: 'What the app keeps and why, what stays on the phone, who processes it (Supabase, Resend, Apple and Google), how long, security, rights under UK GDPR, age (16+).',
            exits: [
                { tap: 'Any heading under On this page', kind: 'jump' },
                { tap: 'ask us to delete it', to: 'tracker-deletion', kind: 'page' },
                { tap: 'ico.org.uk', kind: 'external' },
                { tap: 'Breadcrumb: IJJI Tracker', to: 'app', kind: 'page' },
                { tap: 'Breadcrumb: Apps', to: 'apps', kind: 'page' },
            ],
        },
        {
            id: 'tracker-terms',
            col: 'legal',
            path: '/apps/:appSlug/terms',
            title: 'IJJI Tracker terms of use',
            route: '/apps/ijji-tracker/terms',
            how: 'The app page, the footer',
            note: 'Licence, acceptable use, your content, liability within UK consumer law, Apple’s required terms, England and Wales.',
            exits: [
                { tap: 'privacy policy', to: 'tracker-privacy', kind: 'page' },
                { tap: 'on our website (delete)', to: 'tracker-deletion', kind: 'page' },
                { tap: 'Breadcrumb: IJJI Tracker', to: 'app', kind: 'page' },
            ],
        },
        {
            id: 'tracker-support',
            col: 'legal',
            path: '/apps/:appSlug/support',
            title: 'IJJI Tracker support',
            route: '/apps/ijji-tracker/support',
            how: 'App Store support URL, Get support, the footer',
            note: 'Questions on signing in (links on the same phone, expired links, passwords), reminders, moving phones, exporting, deleting.',
            exits: [
                {
                    tap: 'send us a message',
                    to: 'contact',
                    kind: 'page',
                    note: 'Opens with Help with IJJI Tracker chosen.',
                },
                { tap: 'support@ijji-labs.com', kind: 'external' },
                { tap: 'Ask us to delete it', to: 'tracker-deletion', kind: 'page' },
                { tap: 'privacy policy', to: 'tracker-privacy', kind: 'page' },
            ],
        },
        {
            id: 'tracker-deletion',
            col: 'legal',
            path: '/apps/:appSlug/delete-account',
            title: 'Delete your IJJI Tracker account',
            route: '/apps/ijji-tracker/delete-account',
            how: 'Google Play’s deletion URL, the footer',
            note: 'The in-app steps (Profile → Settings → Delete account), then a form for anyone without the app. We confirm by email from support@ before deleting, within 30 days.',
            exits: [
                { tap: 'Request deletion', to: 'deletion-received', kind: 'submit' },
                {
                    tap: 'Request deletion, when sending fails',
                    to: 'deletion-failed',
                    kind: 'submit',
                },
                { tap: 'privacy policy', to: 'tracker-privacy', kind: 'page' },
            ],
        },
        {
            id: 'website-privacy',
            col: 'legal',
            path: '/privacy',
            title: 'Website privacy policy',
            route: '/privacy',
            how: 'The footer',
            note: 'What the contact and deletion forms collect, how long it’s kept, hosting on Netlify, no cookies or analytics, self-hosted fonts.',
            exits: [
                { tap: 'Contact', to: 'contact', kind: 'page' },
                { tap: 'App account deletion', to: 'tracker-deletion', kind: 'page' },
            ],
        },

        // After sending
        {
            id: 'sent',
            col: 'results',
            title: 'Message sent!',
            route: 'In place of the form',
            how: 'Send message, when it works',
            note: 'Promises a reply within one business day. The Netlify function checks the message against the same rules as the form, then emails it to the studio with Reply-To set to the sender.',
            exits: [
                {
                    tap: 'Send another message',
                    to: 'contact',
                    kind: 'inplace',
                    note: 'Shows an empty form again, on the same page.',
                },
            ],
        },
        {
            id: 'send-failed',
            col: 'results',
            title: 'Failed to send message',
            route: 'Under the form',
            how: 'Send message, when it fails',
            note: 'What they typed stays.',
            exits: [{ tap: 'Send message again', to: 'sent', kind: 'submit' }],
        },
        {
            id: 'deletion-received',
            col: 'results',
            title: 'Request received',
            route: 'In place of the deletion form',
            how: 'Request deletion, when it works',
            note: 'Says we’ll email from support@ to confirm, then delete within 30 days. The studio gets an email with the steps; nothing is sent to the address typed in.',
            exits: [],
        },
        {
            id: 'deletion-failed',
            col: 'results',
            title: 'We couldn’t send your request',
            route: 'Under the deletion form',
            how: 'Request deletion, when it fails',
            note: 'What they typed stays.',
            exits: [{ tap: 'Request deletion again', to: 'deletion-received', kind: 'submit' }],
        },
    ],

    journeys: [
        {
            title: 'Finding out and getting in touch',
            note: 'The path the studio side is built for.',
            steps: [
                ['home', 'Scrolls the hero, about, services, apps and work'],
                ['contact', 'Uses the form at the bottom of Home, or Get in touch'],
                ['sent', 'Sees Message sent!'],
            ],
        },
        {
            title: 'Finding IJJI Tracker from Home',
            steps: [
                ['home', 'Reaches Our apps; taps See IJJI Tracker'],
                ['app', 'Reads What it does; sees Coming soon on both stores'],
                ['tracker-privacy', 'Opens Privacy policy under Privacy and support'],
            ],
        },
        {
            title: 'A store reviewer checks the policies',
            note: 'Apple and Google open these URLs from the listing, often without running JavaScript.',
            steps: [
                ['app-store', 'Opens the privacy policy and support URLs'],
                ['tracker-privacy', 'Reads what is collected, why, where, how long, how to delete'],
                ['google-play', 'Opens the account-deletion URL'],
                ['tracker-deletion', 'Finds the in-app steps and the web form'],
            ],
        },
        {
            title: 'Deleting an account without the app',
            note: 'Google Play requires this route.',
            steps: [
                ['footer', 'Taps IJJI Tracker: Delete account'],
                [
                    'tracker-deletion',
                    'Enters the account email, ticks the confirmation, taps Request deletion',
                ],
                ['deletion-received', 'Waits for our confirmation email from support@'],
            ],
        },
        {
            title: 'Getting help with IJJI Tracker',
            steps: [
                ['tracker-support', 'Reads the answers; taps send us a message'],
                ['contact', 'The topic is already Help with IJJI Tracker; no phone needed'],
                ['sent', 'Sees Message sent!'],
            ],
        },
        {
            title: 'An old link',
            steps: [
                ['search', 'Follows a link to a page that doesn’t exist'],
                ['not-found', 'Sees Page not found'],
                ['home', 'Clicks home page'],
            ],
        },
    ],

    notes: [
        {
            tag: 'Before release',
            html: 'The privacy policy, terms and support page are plain-English drafts written from what the app does. Have them <strong>reviewed</strong> before pasting the URLs into App Store Connect and the Play Console.',
        },
        {
            tag: 'Confirm',
            html: 'The policies say data is held in the <strong>UK or EU</strong> and that backups roll over <strong>within 30 days</strong>. Check both against the Supabase project (Settings → General, and the plan’s backup retention) and adjust <span class="mono">src/content/site.ts</span> if needed.',
        },
        {
            tag: 'Confirm',
            html: 'Policies give <strong>support@ijji-labs.com</strong>; the tracker’s Supabase setup sends email from <strong>ijjilabs.com</strong> (no hyphen). Make sure the support mailbox exists and both domains are yours.',
        },
        {
            tag: 'Process',
            html: 'Web deletion requests arrive as an email with the steps. Someone has to <strong>reply, confirm and delete in Supabase within 30 days</strong>: decide who, and keep the reply for up to a year as the policy says.',
        },
        {
            tag: 'Copy',
            html: 'The three <strong>project descriptions</strong> were rewritten to match the companies’ fields, and the images are still Unsplash placeholders. Check both against the real engagements.',
        },
        {
            tag: 'Fixed',
            html: 'In this pass: Home and About now lead on to fuller pages; the reply time is the same everywhere; Get in touch is in the navbar on phones; the menu closes with Esc and manages focus; every page has its own title and description and is pre-rendered; three.js loads only on Home; fonts are self-hosted. Then a measured pass: Lighthouse accessibility, best practices and SEO 100 on every page, no layout shift; photos in AVIF/WebP; low-contrast text fixed; the navbar no longer wraps at 320px; reduced-motion respected; a strict CSP; schema.org structured data, llms.txt, and a real social preview image and logo (both were missing).',
        },
    ],
};
