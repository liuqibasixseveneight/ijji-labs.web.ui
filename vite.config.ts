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
        chunkSizeWarningLimit: 800,
        minify: 'esbuild',
        cssCodeSplit: true,
        sourcemap: false,
    },
});
