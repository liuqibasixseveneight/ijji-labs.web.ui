// Takes out anything that could point to a person before upstream text (log paths, advisor
// details, error messages) reaches the dashboard: emails, ids, IP addresses, tokens and
// query strings. What's left says what went wrong, not who it happened to.

const RULES: [RegExp, string][] = [
    // JWTs (three base64url parts), before the others nibble at them.
    [/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]'],
    [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]'],
    [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[id]'],
    [/\b(\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
    [/\b(sb_(secret|publishable)_|sbp_)[\w-]+/g, '[key]'],
    // Long runs of letters and digits mixed: keys, hashes, session ids. (Not long names such
    // as rls_auto_enable_on_new_tables, which have no digits, nor paths.)
    [/\b(?=[\w+-]*\d)(?=[\w+-]*[A-Za-z])[\w+-]{32,}={0,2}/g, '[token]'],
];

/**
 * IPv6 addresses, compressed or not. Anything colon-separated is a candidate; it's taken
 * out if it has a `::`, a hex letter or four colons, so times such as 13:00:00 survive.
 */
const IPV6 = /(?<![\w:])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\w:])/gi;
const isIpv6 = (match: string) =>
    match.includes('::') || /[a-f]/i.test(match) || match.split(':').length > 4;

export const scrub = (text: string, max = 300) => {
    let out = text;
    for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
    out = out.replace(IPV6, (match) => (isIpv6(match) ? '[ip]' : match));
    return out.length > max ? `${out.slice(0, max - 1)}…` : out;
};

/** A request path without its query string (which can carry emails or tokens), scrubbed. */
export const scrubPath = (path: string) => scrub(path.split('?')[0].split('#')[0], 120);
