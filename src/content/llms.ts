import { paths } from '../router/paths.ts';
import { apps } from './apps.ts';
import { faqs, services } from './services.ts';
import { pageMeta } from './pages.ts';
import { websitePrivacy } from './policies/websitePrivacy.ts';
import { projects } from './projects.ts';
import { site } from './site.ts';
import type { Inline, PolicyBlock, PolicyDocument } from './types.ts';

/**
 * /llms.txt and /llms-full.txt (llmstxt.org): the site in plain Markdown for AI assistants
 * and answer engines, built from the same content as the pages so it never drifts.
 */

const url = (path: string) => `${site.url}${path === '/' ? '' : path}`;

const inline = (text: Inline[]) =>
    text
        .map((part) => {
            if (typeof part === 'string') return part;
            if ('strong' in part) return `**${part.strong}**`;
            return `[${part.text}](${part.href.startsWith('/') ? url(part.href) : part.href})`;
        })
        .join('');

const block = (b: PolicyBlock): string => {
    switch (b.type) {
        case 'paragraph':
            return inline(b.text);
        case 'note':
            return `> ${inline(b.text)}`;
        case 'list':
            return b.items.map((item) => `- ${inline(item)}`).join('\n');
        case 'table':
            return [
                `| ${b.head.join(' | ')} |`,
                `| ${b.head.map(() => '---').join(' | ')} |`,
                ...b.rows.map((row) => `| ${row.map(inline).join(' | ')} |`),
            ].join('\n');
    }
};

/** A policy as Markdown, under a heading of the given level. */
export const policyMarkdown = (doc: PolicyDocument, path: string, level = 2) => {
    const h = '#'.repeat(level);
    return [
        `${h} ${doc.title}`,
        `${url(path)} · effective ${doc.effectiveDate}`,
        doc.summary,
        ...doc.sections.flatMap((section) => [
            `${h}# ${section.heading}`,
            ...section.blocks.map(block),
            ...(section.faqs ?? []).map((faq) => `**${faq.question}**\n${inline(faq.answer)}`),
        ]),
    ].join('\n\n');
};

/** The short version: who we are, what we do, and links to everything. */
export const llmsTxt = () =>
    [
        `# ${site.name}`,
        `> ${site.description}`,
        [
            `- Based in ${site.location}; works with businesses across the UK.`,
            `- Contact: ${site.email} or ${url(paths.contact)}. We reply ${site.replyTime}.`,
            `- Services: ${services.map((service) => service.title).join('; ')}.`,
            `- Our apps: ${apps.map((app) => `${app.name} (${app.tagline})`).join('; ')}.`,
        ].join('\n'),
        '## Pages',
        [
            [pageMeta.about, 'About'],
            [pageMeta.services, 'Services'],
            [pageMeta.projects, 'Our work'],
            [pageMeta.apps, 'Apps'],
            [pageMeta.contact, 'Contact'],
        ]
            .map(([meta, name]) => {
                const m = meta as { path: string; description: string };
                return `- [${name}](${url(m.path)}): ${m.description}`;
            })
            .join('\n'),
        '## Apps',
        apps
            .map((app) => {
                const to = paths.app(app.slug);
                return [
                    `- [${app.name}](${url(to.root)}): ${app.summary}`,
                    `  - [Privacy policy](${url(to.privacy)})`,
                    `  - [Terms of use](${url(to.terms)})`,
                    `  - [Support](${url(to.support)})`,
                    `  - [Delete your account](${url(to.deleteAccount)})`,
                ].join('\n');
            })
            .join('\n'),
        '## Optional',
        [
            `- [Full text of this site, including every policy](${site.url}/llms-full.txt)`,
            `- [Website privacy policy](${url(paths.privacy)})`,
        ].join('\n'),
    ].join('\n\n') + '\n';

/** Everything: services, FAQs, apps and the full text of every policy. */
export const llmsFullTxt = () =>
    [
        `# ${site.name}`,
        `> ${site.description}`,
        `Based in ${site.location}. Contact ${site.email} (${url(paths.contact)}); we reply ${site.replyTime}. Controller for personal data: ${site.controller}.`,
        '## Services',
        ...services.map(
            (service) =>
                `### ${service.title}\n\n${service.tagline}\n\n${service.description}\n\n${service.body.join('\n\n')}\n\nIncluded:\n${service.included.map((item) => `- ${item}`).join('\n')}`,
        ),
        '## Frequently asked questions',
        ...faqs.map(({ question, answer }) => `**${question}**\n${String(answer)}`),
        '## Client work',
        ...projects.map(
            (project) =>
                `- **${project.name}** (${project.services.join(', ')}): ${project.description}`,
        ),
        '## Apps',
        ...apps.flatMap((app) => {
            const to = paths.app(app.slug);
            return [
                `### ${app.name}\n\n${app.tagline} ${app.summary}\n\n${url(to.root)} · For ages ${app.minimumAge}+ · iOS and Android (${Object.values(app.platforms).every((p) => p === 'coming-soon') ? 'coming soon' : 'available'})\n\n${app.features.map((f) => `- **${f.title}**: ${f.description}`).join('\n')}`,
                policyMarkdown(app.policies.privacy, to.privacy, 3),
                policyMarkdown(app.policies.terms, to.terms, 3),
                policyMarkdown(app.policies.support, to.support, 3),
                policyMarkdown(app.policies.deletion, to.deleteAccount, 3),
            ];
        }),
        policyMarkdown(websitePrivacy, paths.privacy),
    ].join('\n\n') + '\n';
