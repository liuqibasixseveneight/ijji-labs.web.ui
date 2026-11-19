import { describe, expect, it } from 'vitest';

import * as content from '../index.ts';
import { PROJECT_TYPES } from '../../components/ui/organisms/ContactForm/constants.ts';
import { apps } from '../apps.ts';
import { site } from '../site.ts';
import type { Inline, PolicyDocument } from '../types.ts';

/** Every string a visitor can read, anywhere in the content. */
const allText = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(allText);
    if (value && typeof value === 'object') return Object.values(value).flatMap(allText);
    return [];
};

const documents: [string, PolicyDocument][] = [
    ['website privacy', content.websitePrivacy],
    ...apps.flatMap((app) =>
        Object.entries(app.policies).map(
            ([kind, doc]) => [`${app.name} ${kind}`, doc] as [string, PolicyDocument],
        ),
    ),
];

describe('content', () => {
    it('leaves no placeholders or notes-to-self for visitors to find', () => {
        const leftovers = allText(content).filter((text) =>
            /\b(TODO|TBD|FIXME|lorem ipsum)\b|\[[A-Z_ ]{3,}\]/i.test(text),
        );

        expect(leftovers).toEqual([]);
    });

    it('promises one reply time, from site.ts', () => {
        const promises = allText(content).filter((text) =>
            /within (one|two|\d+) (business|working) day/.test(text),
        );

        expect(promises.length).toBeGreaterThan(0);
        expect(promises.filter((text) => !text.includes(site.replyTime))).toEqual([]);
    });

    // support@ for the apps and the policies; hello@ for the studio's enquiries.
    it('gives only the two contact addresses, each from site.ts', () => {
        const emails = allText(content).flatMap(
            (text) => text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [],
        );

        expect(new Set(emails)).toEqual(new Set([site.email, site.studioEmail]));
    });
});

describe('what we offer', () => {
    it('client services are websites only: we make apps of our own, not for clients', () => {
        expect(content.services.map((service) => service.id)).toEqual([
            'websites',
            'handover',
            'support',
        ]);
        expect(JSON.stringify([content.services, content.serviceCards])).not.toMatch(
            /\b(app|apps|iOS|Android|App Store|Google Play)\b/,
        );
    });

    it('the contact form’s only app topic is help with IJJI Tracker', () => {
        expect(PROJECT_TYPES.filter((type) => /\bapp\b|tracker/i.test(type))).toEqual([
            'Help with IJJI Tracker',
        ]);
    });
});

describe('apps', () => {
    it.each(apps)('$name has a slug fit for a URL, and every policy', (app) => {
        expect(app.slug).toMatch(/^[a-z0-9-]+$/);
        expect(Object.keys(app.policies).sort()).toEqual([
            'deletion',
            'privacy',
            'support',
            'terms',
        ]);
        expect(app.minimumAge).toBeGreaterThanOrEqual(13);
        expect(app.description.length).toBeLessThanOrEqual(160);
    });

    it('slugs are unique', () => {
        const slugs = apps.map((app) => app.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('IJJI Tracker’s copy speaks its own language: tracking, never studying', () => {
        const tracker = apps.find((app) => app.slug === 'ijji-tracker')!;

        expect(
            allText(tracker).filter((text) => /\bstud(y|ying|ies)\b|classroom/i.test(text)),
        ).toEqual([]);
    });
});

describe.each(documents)('%s', (_, doc) => {
    it('has an effective date that is a real date, not in the future', () => {
        expect(doc.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(`${doc.effectiveDate}T00:00:00Z`);
        expect(Number.isNaN(date.getTime())).toBe(false);
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('gives every section a unique, URL-safe id and a heading', () => {
        const ids = doc.sections.map((section) => section.id);

        expect(new Set(ids).size).toBe(ids.length);
        for (const section of doc.sections) {
            expect(section.id).toMatch(/^[a-z0-9-]+$/);
            expect(section.heading.length).toBeGreaterThan(2);
            expect(section.blocks.length + (section.faqs?.length ?? 0)).toBeGreaterThan(0);
        }
    });

    it('links only to pages, email or https', () => {
        const links = JSON.stringify(doc).match(/"href":"[^"]+"/g) ?? [];
        const hrefs = links.map((link) => link.slice(8, -1));

        expect(hrefs.filter((href) => !/^(\/|mailto:|https:\/\/)/.test(href))).toEqual([]);
    });

    it('has table rows the same width as their header', () => {
        const tables = doc.sections
            .flatMap((section) => section.blocks)
            .filter((block) => block.type === 'table');

        for (const table of tables) {
            for (const row of table.rows as Inline[][][])
                expect(row).toHaveLength(table.head.length);
        }
    });
});
