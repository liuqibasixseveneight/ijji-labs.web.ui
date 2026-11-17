import { getStore } from '@netlify/blobs';

/**
 * Where everything the site keeps in Netlify Blobs lives: Frankfurt, the nearest EU region
 * (Blobs has no Ireland). Site-wide stores don't take the Functions region; a call without
 * `region` silently reads and writes us-east-2 instead, and sees none of this data. So every
 * store is opened here, and ESLint stops `getStore` being imported anywhere else.
 * The website privacy policy names this region: change both together.
 */
export const BLOBS_REGION = 'eu-central-1';

/** Opens a site-wide Blobs store in {@link BLOBS_REGION}, with reads that see the latest write. */
export const store = (name: string) =>
    getStore({ name, region: BLOBS_REGION, consistency: 'strong' });
