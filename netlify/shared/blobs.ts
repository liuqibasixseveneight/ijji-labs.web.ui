import { connectLambda, getStore } from '@netlify/blobs';

/**
 * Where everything the site keeps in Netlify Blobs lives: Frankfurt, the nearest EU region
 * (Blobs has no Ireland). Site-wide stores don't take the Functions region; a call without
 * `region` silently reads and writes us-east-2 instead, and sees none of this data. So every
 * store is opened here, and ESLint stops `getStore` being imported anywhere else.
 * The website privacy policy names this region: change both together.
 */
export const BLOBS_REGION = 'eu-central-1';

/**
 * Opens a site-wide Blobs store in {@link BLOBS_REGION}. Reads see the latest write
 * (`strong`) by default. The form functions (Lambda-style, see {@link connectBlobs}) only get a
 * cached edge address, where `strong` throws BlobsConsistencyError on every call, so they
 * pass `eventual`: fine for writing a new entry.
 */
export const store = (name: string, consistency: 'strong' | 'eventual' = 'strong') =>
    getStore({ name, region: BLOBS_REGION, consistency });

/**
 * The form functions use Netlify's original (Lambda-style) signature, where Blobs needs the
 * event to find the site. Call this first in such a handler; Functions v2 don't need it.
 */
export const connectBlobs = (event: object) => {
    // Absent when a handler runs outside Netlify (tests, bundling checks).
    if ('blobs' in event && event.blobs) {
        connectLambda(event as Parameters<typeof connectLambda>[0]);
    }
};
