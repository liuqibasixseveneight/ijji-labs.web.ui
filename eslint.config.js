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
    {
        files: ['docs/**/*.js'],
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.browser, sourceType: 'script' },
    },
    storybook.configs['flat/recommended'],
]);
