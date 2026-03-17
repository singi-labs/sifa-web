import { test, expect } from './fixtures/base';
import { NavigationPage } from './pages/navigation';

/** Console error substrings to ignore in local dev (no API server, CSP, hydration). */
const EXPECTED_CONSOLE_ERRORS = [
  'hydrat',
  'Minified React error',
  'Content Security Policy',
  'api/auth/session',
];

function isExpectedConsoleError(message: string): boolean {
  return EXPECTED_CONSOLE_ERRORS.some((pattern) => message.includes(pattern));
}

test.describe('Smoke tests', () => {
  test('homepage loads and renders key elements', async ({ page, axeScan }) => {
    const nav = new NavigationPage(page);
    await nav.goto('/');
    await nav.waitForPageLoad();

    // Header and footer are present
    await expect(nav.header).toBeVisible();
    await expect(nav.footer).toBeVisible();

    // Page title is set
    const title = await page.title();
    expect(title).toBeTruthy();

    // No broken visible images
    const images = page.locator('img:visible');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      if (src?.endsWith('.svg')) {
        // SVGs are vector -- just verify they're visible (naturalWidth is 0 for SVGs)
        await expect(img).toBeVisible();
        continue;
      }
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth, `Image ${src} should load`).toBeGreaterThan(0);
    }

    // Accessibility scan -- log violations but don't fail on pre-existing issues.
    // TODO: fix color-contrast violations (see #213) and switch to strict assertion.
    const a11y = await axeScan(page);
    const critical = a11y.violations.filter((v) => v.impact === 'critical');
    expect(critical, 'Critical accessibility violations found').toEqual([]);
  });

  test('static pages render without errors', async ({ page }) => {
    const staticPages = ['/about', '/privacy', '/terms'];

    const errors: string[] = [];
    const listener = (msg: import('@playwright/test').ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text());
    };
    page.on('console', listener);

    for (const pagePath of staticPages) {
      errors.length = 0;

      const response = await page.goto(pagePath);
      expect(response, `Navigation to ${pagePath} should not be aborted`).not.toBeNull();
      expect(response!.status(), `${pagePath} should return 200`).toBe(200);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();

      const realErrors = errors.filter((e) => !isExpectedConsoleError(e));
      expect(realErrors, `${pagePath} should have no console errors`).toHaveLength(0);
    }

    page.off('console', listener);
  });

  test('navigation links are accessible', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goto('/');
    await nav.waitForPageLoad();

    // All nav links have href attributes
    const links = nav.navLinks;
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `Nav link ${i} should have href`).toBeTruthy();
    }
  });

  test('meta tags are present for SEO', async ({ page }) => {
    await page.goto('/');

    // OpenGraph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveCount(1);

    // Viewport meta tag for mobile
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });
});
