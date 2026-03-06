import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { resolve } from 'path';

export default defineConfig({
    testDir: './tests/component',
    snapshotDir: './__snapshots__',
    timeout: 10 * 1000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        ctPort: 3100,
        ctViteConfig: {
            resolve: {
                alias: {
                    '@': resolve(__dirname, './src'),
                },
            },
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
