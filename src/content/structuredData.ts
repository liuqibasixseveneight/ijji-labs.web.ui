import { paths } from '../router/paths.ts';
import { site } from './site.ts';
import type { AccordionEntry } from '../components/ui/organisms/Accordion/types.ts';
import type { AppEntry, Inline, PolicyDocument } from './types.ts';
import type { ServiceDetailItem } from '../components/ui/organisms/ServiceDetailBlock/types.ts';

/**
 * schema.org descriptions of the studio, its services, apps and pages, as JSON-LD. Search
 * engines and AI answer engines read these to understand who we are and what each page is.
 * Every node has a stable `@id`, so pages can refer to the organisation without repeating it.
 */

type Node = Record<string, unknown>;

const url = (path: string) => `${site.url}${path === '/' ? '' : path}`;

export const ORGANIZATION_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

const plain = (text: Inline[]) =>
    text
        .map((part) =>
            typeof part === 'string' ? part : 'strong' in part ? part.strong : part.text,
        )
        .join('');

/** The studio and the site: on every page. */
export const siteGraph = (): Node => ({
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': ORGANIZATION_ID,
            name: site.name,
            url: site.url,
            logo: { '@type': 'ImageObject', url: `${site.url}/logo.png`, width: 512, height: 512 },
            image: `${site.url}/social-preview.png`,
            description: site.description,
            email: site.email,
            foundingDate: '2026',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Leeds',
                addressRegion: 'West Yorkshire',
                addressCountry: 'GB',
            },
            areaServed: { '@type': 'Country', name: 'United Kingdom' },
            knowsAbout: [
                'Website design',
                'Website development',
                'React',
                'Accessibility',
                'Web performance',
            ],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: site.email,
                url: url(paths.contact),
                availableLanguage: 'English',
            },
            sameAs: ['https://www.linkedin.com/company/ijji-labs'],
        },
        {
            '@type': 'WebSite',
            '@id': WEBSITE_ID,
            name: site.name,
            url: site.url,
            inLanguage: 'en-GB',
            publisher: { '@id': ORGANIZATION_ID },
        },
    ],
});

/** A page of the site, of a given schema.org type (WebPage, AboutPage, ContactPage…). */
export const webPage = (
    path: string,
    name: string,
    description: string,
    type = 'WebPage',
    extra: Node = {},
): Node => ({
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url(path)}#webpage`,
    url: url(path),
    name,
    description,
    inLanguage: 'en-GB',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...extra,
});

/** Where a page sits, as a trail of names and links. */
export const breadcrumbs = (trail: { name: string; path: string }[]): Node => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: url(crumb.path),
    })),
});

/** Questions and answers, e.g. the services FAQ or an app's support page. */
export const faqPage = (questions: { question: string; answer: string }[]): Node => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
});

export const servicesFaq = (faqs: AccordionEntry[]) =>
    faqPage(faqs.map(({ question, answer }) => ({ question, answer: String(answer) })));

/** What we offer, as services provided by the studio. */
export const serviceCatalog = (services: ServiceDetailItem[]): Node => ({
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${site.name} services`,
    url: url(paths.services),
    itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
            '@type': 'Service',
            '@id': `${url(paths.services)}#${service.id}`,
            name: service.title,
            description: service.description,
            provider: { '@id': ORGANIZATION_ID },
            areaServed: { '@type': 'Country', name: 'United Kingdom' },
            serviceOutput: service.included.join(', '),
        },
    })),
});

/** One of our apps. */
export const mobileApplication = (app: AppEntry): Node => {
    const to = paths.app(app.slug);
    const live = Object.values(app.platforms).flatMap((status) =>
        typeof status === 'object' ? [status.url] : [],
    );

    return {
        '@context': 'https://schema.org',
        '@type': 'MobileApplication',
        '@id': `${url(to.root)}#app`,
        name: app.name,
        alternateName: app.tagline,
        description: app.summary,
        url: url(to.root),
        image: `${site.url}/apps/${app.slug}/icon.png`,
        operatingSystem: 'iOS, Android',
        applicationCategory: 'ProductivityApplication',
        featureList: app.features.map((feature) => `${feature.title}: ${feature.description}`),
        contentRating: `${app.minimumAge}+`,
        publisher: { '@id': ORGANIZATION_ID },
        author: { '@id': ORGANIZATION_ID },
        privacyPolicy: url(to.privacy),
        termsOfService: url(to.terms),
        ...(live.length ? { downloadUrl: live, installUrl: live } : {}),
    };
};

/** A policy, terms or support page. */
export const policyPage = (path: string, document: PolicyDocument, about?: string): Node =>
    webPage(path, document.title, document.summary, 'WebPage', {
        datePublished: document.effectiveDate,
        dateModified: document.effectiveDate,
        ...(about ? { about: { '@id': about } } : {}),
        hasPart: document.sections.map((section) => ({
            '@type': 'WebPageElement',
            '@id': `${url(path)}#${section.id}`,
            name: section.heading,
        })),
    });

/** A support page's questions as FAQPage. */
export const policyFaqs = (document: PolicyDocument) =>
    faqPage(
        document.sections.flatMap((section) =>
            (section.faqs ?? []).map((faq) => ({
                question: faq.question,
                answer: plain(faq.answer),
            })),
        ),
    );
