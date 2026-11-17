// @vitest-environment node
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { build } from 'esbuild';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * The functions' own tests run through Vite, which supports things a deployed function
 * doesn't (import.meta.glob, asset imports). This bundles each function as Netlify does,
 * with plain esbuild, and runs it in Node, so code that only works under Vite fails here
 * instead of as a 500 in production.
 */
const functionsDir = resolve(import.meta.dirname, '../functions');
const names = readdirSync(functionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
const out = mkdtempSync(join(tmpdir(), 'functions-'));

afterAll(() => rmSync(out, { recursive: true, force: true }));

describe.each(names)('the %s function, bundled as Netlify does', (name) => {
    it('builds without Vite-only code and answers a bad request with a 400', async () => {
        const result = await build({
            entryPoints: [join(functionsDir, name, `${name}.ts`)],
            bundle: true,
            platform: 'node',
            format: 'cjs',
            write: false,
            logLevel: 'silent',
        });
        expect(result.warnings.map((warning) => warning.text)).toEqual([]);

        const file = join(out, `${name}.cjs`);
        writeFileSync(file, result.outputFiles[0].text);
        const fn = createRequire(import.meta.url)(file);

        if (fn.handler) {
            // The form functions: Netlify's original (Lambda-style) signature.
            const response = await fn.handler({ httpMethod: 'POST', body: '{}' }, {});
            expect(response.statusCode).toBe(400);
        } else if (fn.config?.schedule) {
            // A scheduled function: it has no address, so check it's ready to be scheduled.
            expect(typeof fn.default).toBe('function');
        } else {
            // The admin functions: Functions v2, a Request in and a Response out. An empty
            // post from our own pages is refused: 400 by sign-in, 405 by the GET-only ones, and
            // 500 by the rest, which find no admin settings here (so never reach the data).
            const response: Response = await fn.default(
                new Request(`https://www.ijji-labs.com${fn.config.path}`, {
                    method: 'POST',
                    headers: { Origin: 'https://www.ijji-labs.com', 'X-Admin-Request': '1' },
                    body: '{}',
                }),
            );
            expect([400, 405, 500]).toContain(response.status);
        }
        // Bundling a whole function with esbuild can pass the default 5s while the rest of
        // the suite runs alongside it.
    }, 30_000);
});

describe('the admin edge gate, bundled for the edge', () => {
    it('uses only web APIs (no Node built-ins or npm packages), as Deno needs', async () => {
        const result = await build({
            entryPoints: [
                resolve(import.meta.dirname, '../edge-functions/admin-gate/admin-gate.ts'),
            ],
            bundle: true,
            platform: 'neutral',
            format: 'esm',
            write: false,
            logLevel: 'silent',
        });
        expect(result.warnings.map((warning) => warning.text)).toEqual([]);
        expect(result.outputFiles[0].text).not.toMatch(/from\s*["'](node:|[a-z@])/);
    }, 30_000);
});

describe('the functions folders', () => {
    // Netlify deploys every top-level file in these folders as a function of its own (a test
    // file there once broke a deploy). Each function lives in a folder named after it, with
    // its tests and helpers beside it; only the file named after the folder is deployed.
    it.each(['functions', 'edge-functions'])('netlify/%s holds only folders', (folder) => {
        const dir = resolve(import.meta.dirname, '..', folder);
        const files = readdirSync(dir, { withFileTypes: true }).filter((e) => !e.isDirectory());
        expect(files.map((e) => e.name)).toEqual([]);

        for (const entry of readdirSync(dir)) {
            expect(readdirSync(join(dir, entry))).toContain(`${entry}.ts`);
        }
    });
});
