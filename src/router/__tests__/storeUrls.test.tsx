import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp.tsx';
import { paths } from '../paths.ts';

/**
 * These addresses are in App Store Connect and the Google Play Console. If one moves, the
 * store listings break and an app can be pulled. They are written out in full on purpose:
 * don't change this list to make a test pass; change the store listings first.
 */
const STORE_URLS = [
    { url: '/apps/ijji-tracker/privacy', heading: 'IJJI Tracker privacy policy', store: 'both' },
    { url: '/apps/ijji-tracker/support', heading: 'IJJI Tracker support', store: 'Apple' },
    {
        url: '/apps/ijji-tracker/delete-account',
        heading: 'Delete your IJJI Tracker account',
        store: 'Google Play',
    },
    { url: '/apps/ijji-tracker/terms', heading: 'IJJI Tracker terms of use', store: 'licence' },
    { url: '/privacy', heading: 'Website privacy policy', store: 'website' },
];

describe('store-listed URLs', () => {
    it('are what paths.ts builds', () => {
        const tracker = paths.app('ijji-tracker');

        expect([
            tracker.privacy,
            tracker.support,
            tracker.deleteAccount,
            tracker.terms,
            paths.privacy,
        ]).toEqual(STORE_URLS.map(({ url }) => url));
    });

    it.each(STORE_URLS)(
        '$url ($store) shows its document with an effective date',
        ({ url, heading }) => {
            renderApp(url);

            expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
            expect(screen.getByText(/^Effective/)).toHaveTextContent(/Effective \d{1,2} \w+ \d{4}/);
        },
    );

    it('the privacy policy names the controller, a contact address and the ICO', () => {
        renderApp('/apps/ijji-tracker/privacy');

        expect(
            screen.getAllByText(/ijji labs, a sole trader based in Leeds/).length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByRole('link', { name: 'support@ijji-labs.com' }).length,
        ).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: /ico\.org\.uk/ })).toHaveAttribute(
            'href',
            'https://ico.org.uk/make-a-complaint/',
        );
    });

    it('the deletion page explains the in-app route and offers the web form', () => {
        renderApp('/apps/ijji-tracker/delete-account');

        expect(screen.getByText(/Tap Settings, then Delete account/)).toBeInTheDocument();
        expect(
            screen.getByRole('form', { name: 'Ask us to delete your IJJI Tracker account' }),
        ).toBeInTheDocument();
    });
});
