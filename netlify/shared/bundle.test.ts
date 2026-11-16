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
        const { handler } = createRequire(import.meta.url)(file);

        const response = await handler({ httpMethod: 'POST', body: '{}' }, {});
        expect(response.statusCode).toBe(400);
    });
});
