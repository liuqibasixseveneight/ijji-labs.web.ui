import type { ServiceDetailItem } from '../../ui';

export interface FaqItem {
    question: string;
    answer: string;
}

export const servicesData: ServiceDetailItem[] = [
    {
        title: 'Website Design & Development',
        tagline: 'From concept to a site that actually performs.',
        description:
            'We design and build fast, modern websites that are tailored to your business — not adapted from a generic template. Every project starts with understanding your goals, audience, and brand before a single pixel is placed.',
        body: [
            "The design process is collaborative throughout. We begin with low-fidelity concepts to establish layout and structure, then move into detailed high-fidelity designs covering every page and interaction. Nothing moves to development until you've signed off.",
            "Once in build, we develop to spec — responsive across all screen sizes, accessible to WCAG standards, and optimised for performance from the ground up. We handle all third-party integrations, whether that's a booking system, CRM, analytics, or payment provider.",
            'We work with modern frameworks and tooling, ensuring your site is fast to load, easy to maintain, and built to last. No bloated page builders, no unnecessary plugins — just clean, purposeful code.',
        ],
        included: [
            'UX research & information architecture',
            'Low-fidelity wireframes',
            'High-fidelity visual design (all pages)',
            'Client sign-off before development',
            'Responsive development (mobile, tablet, desktop)',
            'Accessibility (WCAG 2.1 AA)',
            'Performance optimisation',
            'Third-party integrations',
            'On-page SEO foundations',
            'Google Analytics / Search Console setup',
        ],
    },
    {
        title: 'Handover & Training',
        tagline: 'You leave knowing exactly how to run your site.',
        description:
            "Every project concludes with a proper handover — not a zip file and a goodbye. We make sure you understand your site, can manage it confidently, and aren't left dependent on us for day-to-day tasks.",
        body: [
            "We provide full written documentation covering your content management system, how to update pages, add images, manage blog posts, and handle common maintenance tasks. It's written in plain English — no jargon, no assumed knowledge.",
            'The handover session is a live walkthrough, recorded so you can revisit it whenever you need. We walk through every part of the system relevant to you and leave dedicated time for your questions before sign-off.',
            'Our goal is for you to feel fully in control of your site — not reliant on a developer every time something needs changing.',
        ],
        included: [
            'Full written CMS documentation',
            'Maintenance & update guide',
            'Live walkthrough session (recorded)',
            'Dedicated Q&A time before sign-off',
            'Admin access handover & credential management',
            'Hosting & domain guidance',
        ],
    },
    {
        title: 'Post-Launch Support',
        tagline: "We're still here when you need us.",
        description:
            "If you'd rather not manage updates yourself, we offer a flexible support package. Some clients want full ownership from day one; others prefer to hand ongoing maintenance back to us. Both are valid — and both are catered for.",
        body: [
            'Support packages cover routine content updates, software and plugin maintenance, security patches, and performance monitoring. You simply get in touch when something needs changing, and we handle it with a fast turnaround.',
            "There's no retainer lock-in. Support is available on a rolling monthly basis or ad-hoc at an agreed hourly rate — whatever suits your budget and how often you anticipate needing changes.",
            "We're always transparent about what's included and what would attract an additional cost. No surprises.",
        ],
        included: [
            'Content & copy updates',
            'Image and media management',
            'Software, framework & plugin updates',
            'Security monitoring & patches',
            'Performance monitoring',
            'Priority response time',
        ],
        optional: true,
    },
];

export const faqData: FaqItem[] = [
    {
        question: 'How much does a website cost?',
        answer: "Every project is scoped and priced individually based on the number of pages, design complexity, integrations required, and timeline. We're transparent from the first conversation — no vague estimates or hidden fees. Once we understand your requirements, we provide a fixed quote before any work begins.",
    },
    {
        question: 'How long does a project typically take?',
        answer: 'Most projects run between 6 and 12 weeks from kick-off to launch, depending on scope and how quickly feedback is returned. We agree a timeline upfront and stick to it. Discovery and design typically take the most time — because getting that right means development moves quickly and cleanly.',
    },
    {
        question: 'Do you work with businesses outside of Leeds?',
        answer: "Yes. We're based in Leeds but work with businesses across the UK. Everything is handled remotely — discovery calls, design reviews, and handover sessions are all conducted online (though we can arrange in-person meetings if requested).",
    },
    {
        question: "Can I update the site myself once it's launched?",
        answer: "That's the goal. Every project includes a handover, documentation, and a walkthrough session so you can manage your own content confidently. If you'd rather not, our post-launch support package is available — but the choice is always yours.",
    },
    {
        question: 'What platform do you build on?',
        answer: "We work with modern frameworks and tooling chosen for performance and longevity. The specific stack is discussed during discovery based on your needs. We don't lock clients into proprietary platforms — you own your site and can take it anywhere.",
    },
    {
        question: 'Do you redesign existing websites?',
        answer: "Yes. Whether you need a full redesign, a performance overhaul, or a refresh of an outdated site, we can help. We'll assess what's working, what isn't, and recommend an approach that makes sense — not the most expensive one.",
    },
    {
        question: 'Will my website rank on Google?',
        answer: "We build every site with solid SEO foundations — semantic HTML, structured data, page speed optimisation, mobile responsiveness, and Search Console setup. Long-term search performance also depends on content strategy and ongoing effort, which we can advise on. We're honest about what a launch can and can't achieve.",
    },
    {
        question: 'Do you offer e-commerce websites?',
        answer: "Yes. We build e-commerce functionality either through established platforms or custom-built solutions, depending on what's right for your business. Payment integrations, product management, and order flows are all within scope — discuss your requirements during discovery.",
    },
    {
        question: 'What happens if I need changes after launch?',
        answer: "Minor amends in the immediate post-launch period are covered as standard. Beyond that, changes can be handled through our support package or at an agreed ad-hoc rate. We're straightforward about what falls within scope and what doesn't.",
    },
    {
        question: 'How do I get started?',
        answer: "Get in touch via our contact page or drop us an email. We'll arrange a short discovery call to understand your project, then follow up with a clear proposal and quote. No obligation, no hard sell.",
    },
];
