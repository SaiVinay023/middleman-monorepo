import { test, expect } from '@playwright/experimental-ct-react';
import { PostGigForm } from '../../src/components/company/PostGigForm';

test.describe('PostGigForm (Component Test)', () => {
    test('Shows validation errors on empty submission', async ({ mount }) => {
        let submitted = false;
        const component = await mount(
            <PostGigForm
                onSubmit={async () => { submitted = true; }}
                onCancel={() => { }}
                isLoading={false}
            />
        );

        // Clear title and set negative pay amount directly
        await component.getByPlaceholder('e.g. Install Office Network').fill('');
        await component.getByLabel('Pay Amount ($)').fill('-50');

        await component.getByRole('button', { name: 'Post Gig' }).click();

        // Validations from Zod
        await expect(component.locator('text=String must contain at least').first()).toBeVisible();
        await expect(component.locator('text=Number must be greater than')).toBeVisible();
        expect(submitted).toBe(false);
    });

    test('Successfully submits valid data', async ({ mount }) => {
        let submittedData = null;

        const component = await mount(
            <PostGigForm
                onSubmit={async (data) => { submittedData = data; }}
                onCancel={() => { }}
                isLoading={false}
            />
        );

        await component.getByPlaceholder('e.g. Install Office Network').fill('Valid Title');
        await component.getByPlaceholder('e.g. Networking').fill('Category');
        await component.getByPlaceholder('e.g. 123 Main St, Remote').fill('123 Main St');
        await component.getByLabel('Pay Amount ($)').fill('100');
        await component.getByLabel('Schedule Date/Time').fill('2026-10-10T10:00');
        await component.getByPlaceholder('Describe the job requirements...').fill('Test description');

        await component.getByRole('button', { name: 'Post Gig' }).click();

        // Check if callback was triggered (implies successful validation)
        expect(submittedData).toBeTruthy();
        expect((submittedData as any)?.title).toBe('Valid Title');
        expect((submittedData as any)?.pay_amount).toBe(100);
    });
});
