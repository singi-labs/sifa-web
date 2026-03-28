import { test, expect } from './fixtures/base';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

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

    // "Why do I create an account somewhere else?" expandable
    const details = page.locator('details');
    await expect(details).toBeVisible();

    // Expand the details
    await details.locator('summary').click();

    // Should contain the explanation text
    const explanation = details.locator('p');
    await expect(explanation).toBeVisible();
  });

  test('shows provider signup buttons', async ({ page }) => {
    await page.goto('/login');

    // Wait for auth check to complete and login form to render
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Provider cards are now buttons (prompt=create flow)
    const providerButtons = page.locator('button[type="button"]');
    const count = await providerButtons.count();
    expect(count, 'Should have provider signup buttons').toBeGreaterThanOrEqual(3);

    // Each provider has a "Read more" link
    const readMoreLinks = page.locator('a[target="_blank"]');
    const linkCount = await readMoreLinks.count();
    expect(linkCount, 'Should have read more links').toBeGreaterThanOrEqual(3);
  });
});

// These tests require a running sifa-api on localhost:3100.
// CI only starts the Next.js frontend, so skip when no API is available.
test.describe('OAuth backend health', () => {
  test.skip(!!process.env.CI, 'Requires sifa-api — not available in CI');

  test('OAuth metadata endpoint returns valid configuration', async ({ request }) => {
    // If OAuth keys are missing, this endpoint won't be registered (404)
    // or the API won't start at all (after the startup guard fix).
    const res = await request.get(`${API_URL}/oauth/client-metadata.json`);
    expect(res.status(), 'OAuth metadata should be accessible').toBe(200);

    const metadata = await res.json();
    expect(metadata.client_id).toContain('/oauth/client-metadata.json');
    expect(metadata.token_endpoint_auth_method).toBe('private_key_jwt');
    expect(metadata.dpop_bound_access_tokens).toBe(true);
    expect(metadata.redirect_uris).toBeDefined();
    expect(metadata.redirect_uris.length).toBeGreaterThan(0);
  });

  test('API readiness endpoint confirms all backends', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health/ready`);
    expect(res.status(), 'API readiness check should pass').toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.components.postgresql.status).toBe('ok');
    expect(data.components.valkey.status).toBe('ok');
  });
});
