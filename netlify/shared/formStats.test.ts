// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryBlobs } from './admin/testing.ts';

const blobs = vi.hoisted(() => ({
    current: null as null | ReturnType<typeof memoryBlobs>,
    failing: false,
}));
vi.mock('./blobs.ts', () => ({
    store: () => {
        if (blobs.failing) throw new Error('Blobs is down');
        return blobs.current!.store();
    },
}));

import { countForm, pruneFormStats, readFormStats } from './formStats.ts';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 20, 12);

describe('form counts', () => {
    beforeEach(() => {
        blobs.current = memoryBlobs();
        blobs.failing = false;
    });

    it('keep only the form, the day and how it went: nothing about who sent it', async () => {
        await countForm('contact', 'sent', NOW);
        const [key] = blobs.current!.data.keys();
        expect(key).toMatch(/^contact\/2026-11-20\/sent\/[0-9a-f-]{36}$/);
        expect(blobs.current!.data.get(key)).toBe('""');
    });

    it('are added up per form, day and outcome', async () => {
        await countForm('contact', 'sent', NOW);
        await countForm('contact', 'sent', NOW);
        await countForm('contact', 'bot', NOW - DAY);
        await countForm('account-deletion', 'invalid', NOW);
        await countForm('contact', 'sent', NOW - 40 * DAY); // older than the window

        const stats = await readFormStats(30, NOW);

        expect(stats.days).toHaveLength(30);
        expect(stats.days.at(-1)).toBe('2026-11-20');
        expect(stats.forms.contact.byDay.at(-1)).toEqual({
            sent: 2,
            invalid: 0,
            bot: 0,
            failed: 0,
        });
        expect(stats.forms.contact.byDay.at(-2)).toEqual({
            sent: 0,
            invalid: 0,
            bot: 1,
            failed: 0,
        });
        expect(stats.forms.contact.total).toEqual({ sent: 2, invalid: 0, bot: 1, failed: 0 });
        expect(stats.forms['account-deletion'].total.invalid).toBe(1);
    });

    it('ignore keys they don’t recognise', async () => {
        await blobs.current!.store().set('contact/2026-11-20/odd/x', '');
        const stats = await readFormStats(30, NOW);
        expect(stats.forms.contact.total).toEqual({ sent: 0, invalid: 0, bot: 0, failed: 0 });
    });

    it('never stop a form when Blobs is down', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        blobs.failing = true;
        await expect(countForm('contact', 'sent', NOW)).resolves.toBeUndefined();
        expect(console.error).toHaveBeenCalled();
    });

    it('are cleared after 90 days', async () => {
        await countForm('contact', 'sent', NOW - 91 * DAY);
        await countForm('account-deletion', 'sent', NOW - 91 * DAY);
        await countForm('contact', 'sent', NOW - 89 * DAY);

        expect(await pruneFormStats(NOW)).toBe(2);
        expect(blobs.current!.data.size).toBe(1);
    });
});
