/**
 * The ijji labs site map: every page, how people reach it, what can be clicked
 * on it and where that leads. index.html draws it; open that file in a browser.
 *
 * Keep it in step with the site: when a route is added, moved or removed, or a
 * page gains, loses or changes a link, update it here.
 * __tests__/screenMap.test.ts fails if a route in src/router/routes.tsx has no
 * screen here, a screen points at a route that's gone, or a link names a
 * screen that isn't on the map.
 *
 * A screen: `id`, `col` (a column id), `title`, `route` (as shown), `how` it
 * opens, `note`, optional `inside` (what changes on the same page), `exits`
 * and, for screens that are routes, `path` (as in routes.tsx: '/', '/about',
 * '*' for the catch-all). `outside` marks a way in from outside the site,
 * `dot` the colour of its "how" dot.
 * An exit: `tap` (exactly what the visitor clicks, using the on-screen copy),
 * `kind` (page, jump, menu, submit, inplace, auto or external), optional `to`
 * (a screen id) and `note`.
 */
window.SCREEN_MAP = {
    columns: [
        { id: 'outside', title: 'Ways in', sub: 'Search, shared links, typed addresses' },
        { id: 'chrome', title: 'On every page', sub: 'Navbar, menu and footer' },
        { id: 'pages', title: 'Pages', sub: 'One route each' },
        { id: 'results', title: 'After sending', sub: 'The contact form’s outcomes' },
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
            note: 'Any page can be the first one. Netlify serves index.html for every path (netlify.toml), so a deep link or a refresh on /about loads the site rather than Netlify’s 404.',
            exits: [
                { tap: 'Lands on the home page', to: 'home', kind: 'auto' },
                {
                    tap: 'Lands on a deep link',
                    to: 'services',
                    kind: 'auto',
                    note: 'Or About, Projects, Contact.',
                },
                { tap: 'Follows a broken or old link', to: 'not-found', kind: 'auto' },
            ],
        },

        // On every page
        {
            id: 'navbar',
            col: 'chrome',
            title: 'Navbar',
            route: 'Top of every page',
            how: 'Always there, sticky',
            note: 'Transparent over the home hero until scrolled 80% of a screen, then dark. On every other page it is dark from the start. The logo and hamburger turn white over a dark palette.',
            exits: [
                { tap: 'ijji labs (logo)', to: 'home', kind: 'page' },
                {
                    tap: 'Get in touch',
                    to: 'contact',
                    kind: 'page',
                    note: 'Tablet and desktop only (hidden below md). On a phone, Contact is in the menu.',
                },
                { tap: 'Hamburger (Open menu)', to: 'menu', kind: 'menu' },
            ],
        },
        {
            id: 'menu',
            col: 'chrome',
            title: 'Menu',
            route: 'Full screen, slides in from the left',
            how: 'Hamburger in the navbar',
            note: 'Locks the page’s scroll while open. While closed it is inert, so its links are out of the tab order. Choosing a page closes it and scrolls to the top.',
            inside: ['Hovering an item shows its big number behind (tablet and up)'],
            exits: [
                { tap: '00 Home — Welcome', to: 'home', kind: 'page' },
                { tap: '01 About — Who we are', to: 'about', kind: 'page' },
                { tap: '02 Services — What we do', to: 'services', kind: 'page' },
                { tap: '03 Projects — Our work', to: 'projects', kind: 'page' },
                { tap: '04 Contact — Say hello', to: 'contact', kind: 'page' },
                {
                    tap: 'Hamburger again (Close menu)',
                    to: 'navbar',
                    kind: 'menu',
                    note: 'There is no Escape key or click-outside to close it.',
                },
            ],
        },
        {
            id: 'footer',
            col: 'chrome',
            title: 'Footer',
            route: 'Bottom of every page',
            how: 'Always there',
            note: 'The current page’s link stays yellow and underlined.',
            exits: [
                { tap: 'ijji labs (logo)', to: 'home', kind: 'page' },
                { tap: 'About', to: 'about', kind: 'page' },
                { tap: 'Services', to: 'services', kind: 'page' },
                { tap: 'Projects', to: 'projects', kind: 'page' },
                { tap: 'Contact', to: 'contact', kind: 'page' },
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
            note: 'One long page: the gradient hero, About us, Our services, Our process, Our work and Let’s talk with the contact form. None of its sections links on to the page that covers it in full.',
            inside: [
                'Palette picker, bottom right of the hero: three light and three dark gradients. A dark one turns the hero text, logo and hamburger white.',
                'Scroll to explore fades once the page moves',
            ],
            exits: [
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
            how: 'Menu, footer',
            dot: '#FAEE47',
            note: 'Our story, Why independent?, Your ownership, What we stand for, We really care. Ends without a call to action: the only way on is the navbar or footer.',
            exits: [
                { tap: 'Our story', kind: 'jump' },
                { tap: 'Why independent?', kind: 'jump' },
                { tap: 'Your ownership', kind: 'jump' },
                { tap: 'What we stand for', kind: 'jump' },
            ],
        },
        {
            id: 'services',
            col: 'pages',
            path: '/services',
            title: 'Services',
            route: '/services',
            how: 'Menu, footer',
            dot: '#FAEE47',
            note: 'The three services in detail, Our process, the FAQ and Ready to start?',
            inside: ['FAQ: one answer open at a time'],
            exits: [
                { tap: 'Design & Development', kind: 'jump' },
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
            how: 'Menu, footer',
            dot: '#FAEE47',
            note: 'The three projects, Our process (as Our approach) and Got a project in mind?',
            exits: [
                { tap: 'CluedIn', kind: 'jump' },
                { tap: 'Dedalus', kind: 'jump' },
                { tap: 'DXC Technology', kind: 'jump' },
                {
                    tap: 'Our approach',
                    kind: 'jump',
                    note: 'Lands on Our process, whose heading doesn’t say Our approach.',
                },
                { tap: 'Get in touch (Got a project in mind?)', to: 'contact', kind: 'page' },
            ],
        },
        {
            id: 'contact',
            col: 'pages',
            path: '/contact',
            title: 'Contact',
            route: '/contact',
            how: 'Get in touch, Contact, just ask',
            dot: '#FAEE47',
            note: 'Let’s talk, the contact form and what to expect: “We’ll reply within one business day”, “No sales pitch”, “Honest about fit”.',
            inside: ['Submitting with gaps shows what each field needs, without sending'],
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
            how: 'A mistyped or old address',
            note: 'Keeps the navbar and footer, so there is always a way on.',
            exits: [
                { tap: 'home page', to: 'home', kind: 'page' },
                { tap: 'Get in touch', to: 'contact', kind: 'page' },
            ],
        },

        // After sending
        {
            id: 'sent',
            col: 'results',
            title: 'Message sent!',
            route: 'In place of the form',
            how: 'Send message, when it works',
            note: '“We’ll be in touch within two working days.” The Netlify function checks the enquiry against the same rules as the form, then emails it to the studio with Reply-To set to the sender.',
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
            note: 'What they typed stays. The message is the function’s own, or “Failed to send — please try again.”',
            exits: [{ tap: 'Send message again', to: 'sent', kind: 'submit' }],
        },
    ],

    journeys: [
        {
            title: 'Finding out and getting in touch',
            note: 'The path the site is built for.',
            steps: [
                ['home', 'Scrolls the hero, about, services and work'],
                ['contact', 'Uses the form at the bottom of Home, or Get in touch'],
                ['sent', 'Sees Message sent!'],
            ],
        },
        {
            title: 'Checking the services first',
            note: 'Someone who wants detail before committing.',
            steps: [
                ['navbar', 'Opens the menu'],
                ['menu', 'Chooses 02 Services'],
                ['services', 'Jumps to FAQ; reads an answer; clicks just ask'],
                ['contact', 'Fills in the form, taps Send message'],
                ['sent', 'Done'],
            ],
        },
        {
            title: 'Looking at past work',
            steps: [
                ['footer', 'Clicks Projects'],
                ['projects', 'Jumps to a project; reads Our approach; taps Get in touch'],
                ['contact', 'Sends an enquiry'],
            ],
        },
        {
            title: 'A sending problem',
            note: 'Resend or the network fails.',
            steps: [
                ['contact', 'Taps Send message'],
                ['send-failed', 'Sees Failed to send message, with the form still filled in'],
                ['sent', 'Tries again'],
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
            tag: 'Dead end',
            html: '<strong>About</strong> ends on <em>We really care</em> with no call to action, unlike Services and Projects. A <strong>Get in touch</strong> block there would match the others.',
        },
        {
            tag: 'Dead end',
            html: '<strong>Home</strong>’s sections (About us, Our services, Our work) don’t link to the pages that cover them in full, so the only routes on are the menu and footer. Consider a “More about us”, “All services” and “All projects” link under each.',
        },
        {
            tag: 'Copy',
            html: 'Contact promises a reply <strong>within one business day</strong>; <strong>Message sent!</strong> says <strong>within two working days</strong>. Pick one.',
        },
        {
            tag: 'Copy',
            html: 'The project descriptions don’t match their names: <strong>CluedIn</strong> is described as a landscaping company, <strong>Dedalus</strong> as a law firm and <strong>DXC Technology</strong> as a furniture studio, while their tags describe data, healthcare and IT. The images are Unsplash placeholders.',
        },
        {
            tag: 'Repetition',
            html: '<strong>Home</strong>’s About us repeats About’s <em>Our story</em> and <em>We really care</em> almost word for word, and <strong>Our process</strong> appears on Home, Services and Projects. Fine for a small site, but Home could trim to a summary.',
        },
        {
            tag: 'Mobile',
            html: 'The navbar’s <strong>Get in touch</strong> is hidden on phones, so Contact is two taps away (menu, then Contact) unless they scroll to the form on Home.',
        },
        {
            tag: 'Menu',
            html: 'The menu closes only from the hamburger: <kbd>Esc</kbd> does nothing and focus isn’t moved into it when it opens.',
        },
        {
            tag: 'Fixed',
            html: 'In this pass: deep links and refreshes 404’d on Netlify (no SPA fallback); the Projects jump links (CluedIn, Dedalus, DXC Technology, Our approach) went nowhere; unknown paths showed React Router’s error screen; a link to a section of another page (/projects#project-dedalus) opened at the top; the form’s fields weren’t tied to their labels; enquiries were emailed as unescaped HTML; and a stray <span class="mono">functions/index.ts</span> deployed a second copy of the contact endpoint.',
        },
    ],
};
