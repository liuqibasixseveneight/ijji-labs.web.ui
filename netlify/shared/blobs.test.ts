// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

const getStore = vi.hoisted(() => vi.fn(() => ({})));
vi.mock('@netlify/blobs', () => ({ getStore }));

import { BLOBS_REGION, store } from './blobs.ts';

describe('Blobs stores', () => {
    it('are always opened in the EU region the privacy policy names', () => {
        store('admin');
        expect(BLOBS_REGION).toBe('eu-central-1');
        expect(getStore).toHaveBeenCalledWith({
            name: 'admin',
            region: 'eu-central-1',
            consistency: 'strong',
        });
    });
});
