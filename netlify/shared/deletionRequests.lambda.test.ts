// @vitest-environment node
// eslint-disable-next-line no-restricted-imports -- sets up Blobs as a Lambda-style function sees it
import { setEnvironmentContext } from '@netlify/blobs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { store } from './blobs.ts';
import { saveRequest } from './deletionRequests.ts';

/**
 * The real Blobs client, set up as Netlify sets it up for a Lambda-style function such as
 * account-deletion (connectLambda): a cached edge address only, no uncached one. On the live
 * site, strong consistency failed there with BlobsConsistencyError, so every request was
 * emailed NOT LOGGED. Saving a request must work in exactly this setup.
 */
describe('saving a deletion request from a Lambda-style function', () => {
    let calls: { url: string; method: string }[];

    beforeEach(() => {
        setEnvironmentContext({
            deployID: 'deploy-1',
            edgeURL: 'https://edge.blobs.test',
            siteID: 'site-1',
            token: 'token-1',
        });
        calls = [];
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string | URL, init: RequestInit = {}) => {
                calls.push({ url: String(url), method: init.method ?? 'GET' });
                return new Response(null, { status: 200 });
            }),
        );
    });
    afterEach(() => vi.unstubAllGlobals());

    it('works, writing to the EU region through the edge', async () => {
        const id = await saveRequest({
            app: 'ijji-tracker',
            appName: 'IJJI Tracker',
            email: 'me@example.com',
        });

        expect(calls).toHaveLength(1);
        expect(calls[0].method.toLowerCase()).toBe('put');
        expect(calls[0].url).toBe(
            `https://edge.blobs.test/region:eu-central-1/site-1/site:deletion-requests/request/${id}`,
        );
    });

    it('would fail with strong consistency, which is why saving doesn’t ask for it', async () => {
        await expect(store('deletion-requests').get('anything')).rejects.toThrow(/uncachedEdgeURL/);
        expect(calls).toHaveLength(0);
    });
});
