import type { AccordionEntry, ServiceCardProps, ServiceDetailItem } from '../components/ui';

/** The three services in full, on /services. `id` is each one's `#anchor`. */
export const services: ServiceDetailItem[] = [
    {
        id: 'websites',
        title: 'Website Design & Development',
        tagline: 'From concept to a site that actually performs.',
        description:
            'We design and build fast, modern websites tailored to your business — not adapted from a generic template. Every project starts with understanding your goals, audience and brand before a single pixel is placed.',
        body: [
            "The design process is collaborative throughout. We begin with low-fidelity concepts to establish layout and structure, then move into detailed designs for every page and interaction. Nothing moves to development until you've signed off.",
            "Once in build, we develop to spec — responsive across every screen size, accessible to WCAG standards, and optimised for performance from the ground up. We handle the third-party integrations, whether that's a booking system, CRM, analytics or payment provider.",
            'No bloated page builders, no unnecessary plugins — just clean, purposeful code that is fast to load and easy to maintain.',
        ],
        included: [
            'UX research & information architecture',
            'Wireframes, then full visual design',
            'Client sign-off before development',
            'Responsive development (mobile, tablet, desktop)',
            'Accessibility (WCAG 2.2 AA)',
            'Performance optimisation',
            'Third-party integrations',
            'On-page SEO foundations',
        ],
    },
    {
        id: 'handover',
        title: 'Handover & Training',
        tagline: 'You leave knowing exactly how to run it.',
        description:
            "Every project concludes with a proper handover — not a zip file and a goodbye. We make sure you understand what we've built, can manage it confidently, and aren't left dependent on us for day-to-day tasks.",
        body: [
            'We provide written documentation for your content, settings and common maintenance tasks, in plain English — no jargon, no assumed knowledge.',
            'The handover session is a live walkthrough, recorded so you can revisit it. We cover everything relevant to you and leave dedicated time for your questions before sign-off.',
            'Our goal is for you to feel in control — not reliant on a developer every time something needs changing.',
        ],
        included: [
            'Written documentation',
            'Maintenance & update guide',
            'Live walkthrough session (recorded)',
            'Dedicated Q&A before sign-off',
            'Admin and account handover',
            'Hosting & domain guidance',
        ],
    },
    {
        id: 'support',
        title: 'Post-Launch Support',
        tagline: "We're still here when you need us.",
        description:
            "If you'd rather not manage updates yourself, we offer a flexible support package. Some clients want full ownership from day one; others prefer to hand ongoing maintenance back to us. Both are catered for.",
        body: [
            'Support covers content updates, software and dependency updates, security patches and monitoring.',
            "There's no retainer lock-in. Support runs month to month or ad hoc at an agreed hourly rate, whichever suits how often you expect to need us.",
            "We're always clear about what's included and what would cost extra. No surprises.",
        ],
        included: [
            'Content & copy updates',
            'Software and dependency updates',
            'Security monitoring & patches',
            'Performance monitoring',
            'Priority response time',
        ],
        optional: true,
    },
];

/** The short versions, as cards on Home. */
export const serviceCards: ServiceCardProps[] = [
    {
        title: 'Websites',
        description:
            'Fast, modern websites designed around your business, every page signed off by you before we build.',
        included: ['UX & visual design', 'Responsive development', 'Performance & accessibility'],
    },
    {
        title: 'Handover & Training',
        description:
            'Documentation and a walkthrough session, so you can run what we build with confidence.',
        included: ['Documentation', 'Walkthrough session', 'Q&A before sign-off'],
    },
    {
        title: 'Post-Launch Support',
        description:
            "If you'd rather not manage updates yourself, a flexible support package keeps things running.",
        included: ['Content updates', 'Software updates', 'Monitoring'],
        optional: true,
    },
];

export const faqs: AccordionEntry[] = [
    {
        question: 'How much does a project cost?',
        answer: "Every project is scoped and priced individually, based on the number of pages, design complexity, integrations and timeline. We're transparent from the first conversation, and once we understand what you need we give you a fixed quote before any work begins.",
    },
    {
        question: 'How long does a project take?',
        answer: 'Most websites take 6 to 12 weeks from kick-off to launch, depending on scope. We agree a timeline up front and stick to it.',
    },
    {
        question: 'Do you build apps for clients?',
        answer: 'No. Our client work is websites. We also make apps of our own, starting with IJJI Tracker; if you need help with it, choose Help with IJJI Tracker on our contact form.',
    },
    {
        question: 'Do you work with businesses outside Leeds?',
        answer: "Yes. We're based in Leeds but work with businesses across the UK. Discovery calls, design reviews and handovers all happen online, and we can meet in person if you'd like.",
    },
    {
        question: "Can I update things myself once it's launched?",
        answer: "That's the goal. Every project includes a handover, documentation and a walkthrough session. If you'd rather not, our post-launch support is there — the choice is yours.",
    },
    {
        question: 'What do you build with?',
        answer: "Modern, well-supported tools chosen for performance and longevity: React and modern web standards. The exact stack is agreed in discovery. We don't lock you into proprietary platforms — you own what we build.",
    },
    {
        question: 'Do you redesign existing websites?',
        answer: "Yes. Whether it's a full redesign, a performance overhaul or a refresh, we'll assess what's working and what isn't, and recommend what makes sense — not the most expensive option.",
    },
    {
        question: 'What happens if I need changes after launch?',
        answer: "Minor amends straight after launch are covered. Beyond that, changes go through our support package or at an agreed ad-hoc rate. We're clear about what's in scope and what isn't.",
    },
    {
        question: 'How do I get started?',
        answer: "Get in touch through our contact page or by email. We'll arrange a short discovery call, then follow up with a clear proposal and quote. No obligation, no hard sell.",
    },
];
