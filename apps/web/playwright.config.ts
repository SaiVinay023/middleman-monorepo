import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Force load local environments
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
    testDir: '../../tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 1 : 2,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
