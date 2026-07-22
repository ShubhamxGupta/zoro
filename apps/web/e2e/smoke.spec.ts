import { test, expect } from '@playwright/test';

test.describe('Repository Intelligence Web Application Smoke Tests', () => {
  test('renders landing page with correct header title and metrics', async ({ page }) => {
    await page.goto('/');

    // Check main title branding
    await expect(page.locator('h1.display-title')).toContainText(
      'Repository Intelligence Dashboard',
    );

    // Check Header breadcrumb
    await expect(page.locator('header')).toContainText('repo-intel');

    // Check Footer status bar
    await expect(page.locator('footer')).toContainText('ONLINE');

    // Check Metric Cards render
    await expect(page.getByText('Code Quality Index')).toBeVisible();
    await expect(page.getByText('Overall Risk Rating')).toBeVisible();
    await expect(page.getByText('Open Review Findings')).toBeVisible();
  });

  test('toggles theme system state between dark and light modes', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Click Theme Switcher Toggle button in header
    const themeToggleBtn = page.getByRole('button', { name: /toggle theme/i });
    if (await themeToggleBtn.isVisible()) {
      await themeToggleBtn.click();
      await expect(htmlElement).toHaveAttribute('data-theme', 'light');
    }
  });

  test('opens global command palette modal on trigger click', async ({ page }) => {
    await page.goto('/');

    // Trigger Command Palette trigger
    const cmdTrigger = page.getByRole('button', { name: /Trigger Review/i });
    await cmdTrigger.click();

    // Verify Command Palette modal opens
    await expect(page.getByText('Global Command Palette')).toBeVisible();
  });
});
