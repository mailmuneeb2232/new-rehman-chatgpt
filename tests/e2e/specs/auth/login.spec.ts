import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sign In/);
    // Implementation: fill form, submit, assert redirect
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    // Implementation: fill invalid creds, assert error message
  });

  test('redirects authenticated user away from login', async ({ page }) => {
    // Implementation: set auth cookie, navigate to /login, assert redirect
    void page;
  });
});
