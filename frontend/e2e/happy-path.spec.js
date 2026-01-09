import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const JOB_TITLE = `E2E Job ${Date.now()}`; // Unique title

const RECRUITER = { email: 'tirthbhadani3@gmail.com', password: 'tirth3', role: 'Recruiter' };

test.describe('Recruitment Process Happy Path', () => {

    test.describe.configure({ mode: 'serial' });

    test('Recruiter Creates Job', async ({ page }) => {
        // Login as Recruiter
        await page.goto(`${BASE_URL}/login`);
        await page.getByRole('button', { name: 'Recruiter' }).click();
        await page.getByPlaceholder('Email Address').fill(RECRUITER.email);
        await page.getByPlaceholder('Password').fill(RECRUITER.password);
        await page.getByRole('button', { name: 'Login' }).click();

        await expect(page).toHaveURL(`${BASE_URL}/recruiter-dashboard`);

        await page.getByRole('button', { name: 'Create Job' }).first().click();

        await page.locator('input[type="text"]').first().fill(JOB_TITLE);
        await page.locator('textarea').first().fill('Test Description');

        await page.locator('.react-select__control').first().click();
        await page.keyboard.press('Enter');

        await page.locator('.modal-content').getByRole('button', { name: 'Create Job' }).click();
        await expect(page.locator('.modal-content')).toBeHidden();

        await page.getByRole('button', { name: 'Jobs' }).click();

        await page.getByPlaceholder('Search jobs by title or status...').fill(JOB_TITLE);
        const jobRow = page.locator('tr').filter({ hasText: JOB_TITLE });
        await expect(jobRow).toBeVisible();

        await page.getByRole('button', { name: 'Logout' }).click();
    });
});