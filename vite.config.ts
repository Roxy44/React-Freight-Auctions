import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages project site: set VITE_BASE_PATH=/React-Freight-Auctions/ in CI. */
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
    base,
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(rootDir, 'src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/shared/config/test-setup.ts'],
    },
});
