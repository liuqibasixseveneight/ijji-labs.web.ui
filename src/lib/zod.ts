import { z } from 'zod';

// zod normally probes for `new Function()` to compile faster validators. The site's
// Content-Security-Policy forbids eval, so the probe would be blocked and reported as a
// CSP error on every page. Our forms are small: validate without compiling.
z.config({ jitless: true });

export { z };
