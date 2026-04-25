// @ts-check
import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const SYSTEM_ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || 'sysadmin@unicrew.com';
const SYSTEM_ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD || 'admin123';

test.describe('System Admin flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel('Email').fill(SYSTEM_ADMIN_EMAIL);
    await page.getByLabel('Password').fill(SYSTEM_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/system-admin$/);
  });

  test('loads system dashboard cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'System Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Universities')).toBeVisible();
    await expect(page.getByText('Students')).toBeVisible();
    await expect(page.getByText('Discussions')).toBeVisible();
    await expect(page.getByText('University admins')).toBeVisible();
  });

  test('opens university management page', async ({ page }) => {
    await page.getByRole('link', { name: 'Universities' }).click();
    await expect(page).toHaveURL(/\/system-admin\/universities$/);
    await expect(page.getByRole('heading', { name: 'University Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add University' })).toBeVisible();
  });

  test('opens admin management page', async ({ page }) => {
    await page.getByRole('link', { name: 'University Admins' }).click();
    await expect(page).toHaveURL(/\/system-admin\/admins$/);
    await expect(page.getByRole('heading', { name: 'University Admin Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Admin' })).toBeVisible();
  });
});
