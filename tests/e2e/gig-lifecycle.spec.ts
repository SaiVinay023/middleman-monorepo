import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client for creating test users directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);
// Use a shared mock setup or test database to keep tests DRY
// We'll simulate the user sessions through the browser context

test.describe('Gig Lifecycle Flow', () => {

    const timestamp = Date.now();
    const companyEmail = `company_${timestamp}@test.com`;
    const adminEmail = `admin_${timestamp}@test.com`;
    const techEmail = `tech_${timestamp}@test.com`;
    const defaultPassword = 'password123';

    test.beforeAll(async () => {
        // Create Company
        await supabase.auth.signUp({
            email: companyEmail,
            password: defaultPassword,
            options: { data: { role: 'company', full_name: 'Test Company' } }
        });
        // Create Admin
        await supabase.auth.signUp({
            email: adminEmail,
            password: defaultPassword,
            options: { data: { role: 'admin', full_name: 'Test Admin' } }
        });
        // Create Freelancer
        await supabase.auth.signUp({
            email: techEmail,
            password: defaultPassword,
            options: { data: { role: 'freelancer', full_name: 'Test Tech' } }
        });
    });

    test('Full Flow: Post -> Approve -> Claim -> Arrive', async ({ browser }) => {
        // We'll create separate browser contexts for the different user roles to allow parallel execution/clean states
        const companyContext = await browser.newContext();
        const adminContext = await browser.newContext();
        const freelancerContext = await browser.newContext();

        // 1. Company posts a gig (Status: pending_admin)
        const companyPage = await companyContext.newPage();
        companyPage.on('console', msg => console.log(`[COMPANY CONSOLE] ${msg.text()}`));

        // Mocking company login
        await companyPage.goto('/login');
        await companyPage.fill('input[name="email"]', companyEmail);
        await companyPage.fill('input[name="password"]', defaultPassword);
        await companyPage.click('button:has-text("Login")');

        // Navigate to dashboard and post gig
        await companyPage.waitForURL('**/company');
        await companyPage.click('text=Post New Gig');
        await companyPage.fill('input[name="title"]', 'Fix Core Router');
        await companyPage.fill('input[name="pay_amount"]', '150');
        await companyPage.click('button:has-text("Post Gig")');

        // Verify gig is pending
        await expect(companyPage.locator('text=Fix Core Router').first()).toBeVisible();
        await expect(companyPage.locator('text=pending admin')).toBeVisible();


        // 2. Admin approves (Status: available)
        const adminPage = await adminContext.newPage();

        await adminPage.goto('/login');
        await adminPage.fill('input[name="email"]', adminEmail);
        await adminPage.fill('input[name="password"]', defaultPassword);
        await adminPage.click('button:has-text("Login")');

        await adminPage.waitForURL('**/admin');
        await adminPage.click('text=Approve Fix Core Router');

        // Ensure status reflects availability (depending on UI this might show 'available' or just disappear from pending list)


        // 3. Freelancer claims (Status: assigned)
        const freelancerPage = await freelancerContext.newPage();

        await freelancerPage.goto('/login');
        await freelancerPage.fill('input[name="email"]', techEmail);
        await freelancerPage.fill('input[name="password"]', defaultPassword);
        await freelancerPage.click('button:has-text("Login")');

        await freelancerPage.waitForURL('**/*'); // freelancer default dashboard

        // Navigate to Job Board and claim
        await freelancerPage.goto('/jobs');
        const claimButton = freelancerPage.locator('button:has-text("Claim Job")').first();
        await expect(claimButton).toBeVisible();
        await claimButton.click();

        // Status should now jump to assigned/in_progress depending on UI specifics
        await expect(freelancerPage.locator('text=My Active Jobs')).toBeVisible();


        // 4. Freelancer "Arrives" via mocked GPS (Status: in_progress)

        // We can mock geolocation in Playwright to simulate Arrival
        await freelancerContext.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
        await freelancerContext.grantPermissions(['geolocation']);

        // Trigger Geofence Check (Assuming the UI has a 'Check In' button that uses Geofence or auto-updates)
        await freelancerPage.click('text=I Have Arrived');

        // Ensure the status updates
        await expect(freelancerPage.locator('text=In Progress').first()).toBeVisible();
    });
});
