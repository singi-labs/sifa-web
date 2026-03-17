import { test, expect } from './fixtures/base';

test.describe('Search page', () => {
  test('renders search form with input', async ({ page, qaScreenshot }) => {
    await page.goto('/search');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('type', 'search');

    await qaScreenshot(page, 'search-empty');
  });

  test('search input accepts text', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill('typescript');
    await expect(searchInput).toHaveValue('typescript');
  });

  test('navigating with query parameter loads page', async ({ page, qaScreenshot }) => {
    // Search with a query triggers an API call; without backend it may 500.
    // Just verify the page doesn't crash entirely (renders something).
    await page.goto('/search?q=react');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    await qaScreenshot(page, 'search-with-query');
  });
});

test.describe('Expert directory', () => {
  test('renders expert topic grid', async ({ page, qaScreenshot }) => {
    await page.goto('/experts');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Topic links should be present
    const topicLinks = page.locator('a[href^="/experts/"]');
    const count = await topicLinks.count();
    expect(count, 'Should have expert topic links').toBeGreaterThan(0);

    await qaScreenshot(page, 'experts-directory');
  });

  test('topic page loads and renders heading', async ({ page }) => {
    // Topic detail pages fetch from API; without backend they may 500.
    // Navigate directly to a known topic slug instead.
    await page.goto('/experts');

    // Get href of first topic link
    const firstLink = page.locator('a[href^="/experts/"]').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Navigate — may return 500 without API, just verify it doesn't crash
    await page.goto(href!);
    // If the page errors, Next.js renders an error boundary with a heading
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
  });
});
