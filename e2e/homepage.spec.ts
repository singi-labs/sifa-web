import { test, expect } from './fixtures/base';

test.describe('Homepage', () => {
  test('renders hero section with CTAs', async ({ page, qaScreenshot }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Main content area should have CTA links
    const main = page.locator('main');
    const searchLink = main.locator('a[href="/search"]');
    await expect(searchLink).toBeVisible();

    await qaScreenshot(page, 'homepage-hero');
  });

  test('CTA navigates to search page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Target the hero CTA by visible text (not the header nav link)
    const main = page.locator('main');
    const searchCTA = main.getByRole('link', { name: /find yourself|search/i }).first();
    await searchCTA.click();

    await page.waitForURL('**/search**', { timeout: 10000 });
    expect(page.url()).toContain('/search');
  });

  test('header has logo linking to home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Logo link to home
    const logoLink = header.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });
});
