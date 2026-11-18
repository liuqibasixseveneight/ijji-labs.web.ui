// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { scrub, scrubPath } from './scrub.ts';

describe('scrubbing upstream text', () => {
    it.each([
        ['an email', 'no user jo.bloggs+test@mail.example.co.uk found', 'no user [email] found'],
        ['an id', 'row 3f2b1c9e-8a7d-4e6f-9b0a-1c2d3e4f5a6b failed', 'row [id] failed'],
        ['an IPv4 address', 'from 203.0.113.42 refused', 'from [ip] refused'],
        ['an IPv6 address', 'from 2001:db8:85a3::8a2e:370:7334 refused', 'from [ip] refused'],
        ['a JWT', 'Bearer eyJhbGciOi.eyJzdWIiOiIx.SflKxwRJSM bad', 'Bearer [token] bad'],
        ['a secret key', 'key sb_secret_abc123XYZ leaked', 'key [key] leaked'],
        ['a long token', `session ${'a1B2'.repeat(10)} expired`, 'session [token] expired'],
    ])('takes out %s', (_, text, expected) => {
        expect(scrub(text)).toBe(expected);
    });

    it('takes out a full IPv6 address too', () => {
        expect(scrub('from 2001:0db8:0000:0000:0000:ff00:0042:8329 refused')).toBe(
            'from [ip] refused',
        );
    });

    it('leaves what says what went wrong', () => {
        const text = 'Function public.admin_stats has a role mutable search_path at 13:00:00';
        expect(scrub(text)).toBe(text);
    });

    it('leaves long paths and names alone', () => {
        const text =
            '/rest/v1/rpc/friends_feed_for_the_current_user and rls_auto_enable_on_new_tables';
        expect(scrub(text)).toBe(text);
    });

    it('keeps it short', () => {
        expect(scrub('x '.repeat(400), 50)).toHaveLength(50);
    });

    it('drops a path’s query string, which can carry emails or tokens', () => {
        expect(scrubPath('/auth/v1/verify?token=abc&email=a@b.co')).toBe('/auth/v1/verify');
        expect(scrubPath('/rest/v1/profiles?id=eq.3f2b1c9e-8a7d-4e6f-9b0a-1c2d3e4f5a6b')).toBe(
            '/rest/v1/profiles',
        );
        expect(scrubPath('/rest/v1/sessions/3f2b1c9e-8a7d-4e6f-9b0a-1c2d3e4f5a6b')).toBe(
            '/rest/v1/sessions/[id]',
        );
    });
});
