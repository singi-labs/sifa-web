import { test, expect } from './fixtures/base';

test.describe('SEO and meta tags', () => {
  test('homepage has required meta tags', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);

    const title = await page.title();
    expect(title).toContain('Sifa');
  });

  test('static pages have unique titles', async ({ page }) => {
    const pages = [
      { path: '/about', expected: 'About' },
      { path: '/privacy', expected: 'Privacy' },
      { path: '/terms', expected: 'Terms' },
    ];

    for (const p of pages) {
      await page.goto(p.path);
      const title = await page.title();
      expect(title, `${p.path} title should contain "${p.expected}"`).toContain(p.expected);
    }
  });

  test('robots.txt is served', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('sitemap.xml is served', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });
});
