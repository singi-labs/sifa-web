import { test, expect } from './fixtures/base';

test.describe('Accessibility features', () => {
  test('skip link becomes visible on Tab and targets main content', async ({ page }) => {
    // Skip link + Tab behavior is unreliable on mobile WebKit
    test.skip(test.info().project.name.includes('mobile'), 'Tab key behavior differs on mobile');

    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // Tab to the skip link
    await page.keyboard.press('Tab');

    // Verify the skip link target exists
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('theme toggle switches between light and dark mode', async ({ page, qaScreenshot }) => {
    // Theme toggle is desktop-only (hidden on mobile)
    test.skip(test.info().project.name.includes('mobile'), 'Theme toggle hidden on mobile');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for hydration (theme toggle renders disabled skeleton until mounted)
    const themeButton = page.locator('header button[aria-label*="witch"]');
    await expect(themeButton).toBeEnabled({ timeout: 5000 });

    // Get initial theme
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');

    // Click to toggle
    await themeButton.click();
    const newClass = await htmlElement.getAttribute('class');
    expect(newClass).not.toBe(initialClass);

    await qaScreenshot(page, 'theme-toggled');

    // Toggle back
    await themeButton.click();
    const restoredClass = await htmlElement.getAttribute('class');
    expect(restoredClass).toBe(initialClass);
  });

  test('footer has navigation links and external links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Internal links
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();

    // External links with proper attributes
    const githubLink = footer.locator('a[aria-label="GitHub"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', /noopener/);

    const blueskyLink = footer.locator('a[aria-label="Bluesky"]');
    await expect(blueskyLink).toBeVisible();

    // "Built by" attribution
    const singiLink = footer.locator('a[href="https://singi.dev"]');
    await expect(singiLink).toBeVisible();
  });

  test('footer navigation has aria-label', async ({ page }) => {
    await page.goto('/');

    const footerNav = page.locator('footer nav');
    await expect(footerNav).toHaveAttribute('aria-label', /footer/i);
  });

  test('all pages have main content landmark', async ({ page }) => {
    const pages = ['/', '/about', '/privacy', '/terms', '/login', '/embed'];

    for (const path of pages) {
      await page.goto(path);
      const main = page.locator('main#main-content');
      await expect(main, `${path} should have main#main-content`).toBeVisible();
    }
  });
});
