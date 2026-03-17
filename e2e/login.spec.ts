import { test, expect } from './fixtures/base';

test.describe('Login page', () => {
  test('renders login form with handle input', async ({ page, qaScreenshot }) => {
    await page.goto('/login');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    const handleInput = page.locator('input[name="handle"]');
    await expect(handleInput).toBeVisible();
    await expect(handleInput).toHaveAttribute('type', 'text');
    await expect(handleInput).toHaveAttribute('autocomplete', 'username');

    // Submit button (text from i18n, visible as "Continue")
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    await qaScreenshot(page, 'login');
  });

  test('has AT Protocol explainer details', async ({ page }) => {
    await page.goto('/login');

    const details = page.locator('details');
    await expect(details).toBeVisible();

    // Expand the details
    await details.locator('summary').click();

    // Should contain links to AT Protocol resources
    const atprotoLink = details.locator('a[href*="atproto"]');
    const count = await atprotoLink.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows account creation options', async ({ page }) => {
    await page.goto('/login');

    // Links to create AT Protocol accounts (Bluesky, Blacksky, Eurosky)
    const accountLinks = page.locator('a[target="_blank"]');
    const count = await accountLinks.count();
    expect(count, 'Should have external account creation links').toBeGreaterThanOrEqual(3);
  });
});
