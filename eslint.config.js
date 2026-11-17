import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist', 'storybook-static', 'coverage', 'docs/screen-map/index.html']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            // `const { a, ...rest } = props` is how we drop props before spreading the rest.
            '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        },
    },
    {
        // Route tables, tests and stories export more than components; fast refresh doesn't apply.
        files: ['src/router/**', '**/*.test.{ts,tsx}', '**/*.stories.tsx', 'src/test/**'],
        rules: { 'react-refresh/only-export-components': 'off' },
    },
    // Admin boundaries (see netlify/shared/admin). The browser code never reaches server code,
    // where the keys are read; the public site never pulls in the dashboard.
    {
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/admin/**', 'src/__tests__/adminIsolation.test.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/netlify/**'],
                            message: 'Server code stays out of the browser.',
                        },
                        {
                            group: ['**/admin', '**/admin/**'],
                            message: 'The public site never imports the admin dashboard.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/admin/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/netlify/**'],
                            message: 'Server code stays out of the browser.',
                        },
                    ],
                },
            ],
            // No build-time values in the dashboard's bundle: it knows no secrets and needs none.
            'no-restricted-syntax': [
                'error',
                {
                    selector: "MetaProperty[meta.name='import'][property.name='meta']",
                    message: 'The admin dashboard reads nothing from import.meta (no env values).',
                },
            ],
        },
    },
    {
        files: ['netlify/**/*.ts'],
        ignores: ['netlify/shared/blobs.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: '@netlify/blobs',
                            message:
                                'Open stores with store() from netlify/shared/blobs.ts, which pins the EU region.',
                        },
                    ],
                },
            ],
        },
    },
    {
        // Node functions and the Deno edge gate run on the server, not in a browser.
        files: ['netlify/**/*.ts'],
        languageOptions: { globals: { ...globals.node } },
    },
    {
        files: ['docs/**/*.js'],
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.browser, sourceType: 'script' },
    },
    storybook.configs['flat/recommended'],
]);
