/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('three')) {
                        return 'three';
                    }

                    if (id.includes('node_modules/react-dom')) {
                        return 'react-dom';
                    }

                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
        // Responsive images stay files: inlined, every size in a srcset would be base64 in
        // every page's HTML and JavaScript, whichever one the browser picks.
        assetsInlineLimit: (file) => (file.includes('/assets/images/') ? false : undefined),
        chunkSizeWarningLimit: 800,
        minify: 'esbuild',
        cssCodeSplit: true,
        sourcemap: false,
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        // Form tests type with user-event, which can pass the default 5s while the whole
        // suite runs (more so under coverage, as CI does).
        testTimeout: 15_000,
        include: ['src/**/*.test.{ts,tsx}', 'netlify/**/*.test.ts', 'docs/**/*.test.ts'],
        css: false,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}', 'netlify/**/*.ts'],
            exclude: [
                '**/*.stories.tsx',
                '**/*.test.{ts,tsx}',
                '**/index.ts',
                '**/types.ts',
                'src/test/**',
                'src/main.tsx',
                'src/router/router.tsx',
                // WebGL: three.js can't run in jsdom. Covered by the FluidGradient story instead.
                'src/components/ui/organisms/FluidGradient/utils/**',
                'src/components/ui/organisms/FluidGradient/shaders.ts',
            ],
            // Lines are the honest measure here. Tests run the React Compiler's output (what ships),
            // and it adds memo-cache branches and helper functions to every component, which drag
            // the other three down whatever the tests do.
            thresholds: { lines: 95, statements: 90, functions: 90, branches: 65 },
        },
    },
});
