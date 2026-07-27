import { test, expect } from '@playwright/test';

test.describe('Repository Intelligence Web Application Smoke Tests', () => {
  test('renders landing page with correct header title and metrics', async ({ page }) => {
    await page.goto('/');

    // Check main title branding in header
    await expect(page.locator('header')).toContainText('Repo Intelligence Platform');

    // Check dashboard heading
    await expect(page.getByRole('heading', { name: 'Repository Dashboard' })).toBeVisible();

    // Check Metric Cards render inside main area
    const mainArea = page.getByRole('main');
    await expect(mainArea.getByText('Repository', { exact: true })).toBeVisible();
    await expect(mainArea.getByText('Index Size', { exact: true })).toBeVisible();
    await expect(mainArea.getByText('Knowledge Graph', { exact: true })).toBeVisible();
    await expect(mainArea.getByText('AI Engine', { exact: true })).toBeVisible();
  });

  test('navigates through application tabs correctly', async ({ page }) => {
    await page.goto('/');

    // Click Review & Findings tab
    await page.getByRole('button', { name: /Review & Findings/i }).click();
    await expect(page.getByText('AI Code Review Engine')).toBeVisible();

    // Click GraphRAG Chat tab
    await page.getByRole('button', { name: /GraphRAG Chat/i }).click();
    await expect(page.getByText('GraphRAG Repository Chat')).toBeVisible();

    // Click AI Providers tab
    await page.getByRole('button', { name: /AI Providers/i }).click();
    await expect(page.getByText('AI Provider Configuration')).toBeVisible();
  });
});
