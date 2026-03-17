import { test, expect } from './fixtures/base';

test.describe('Embed builder', () => {
  test('renders embed builder with input and code preview', async ({ page, qaScreenshot }) => {
    await page.goto('/embed');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    const input = page.locator('#embed-identifier');
    await expect(input).toBeVisible();

    await qaScreenshot(page, 'embed-builder-empty');
  });

  test('generates embed code when handle is entered', async ({ page, qaScreenshot }) => {
    await page.goto('/embed');

    const input = page.locator('#embed-identifier');
    await input.click();
    await input.fill('alice.bsky.social');

    // Wait for React state to update and render the code block
    const codeBlock = page.locator('[data-testid="embed-code"]');
    await expect(codeBlock).toBeVisible({ timeout: 10000 });
    await expect(codeBlock).toContainText('data-handle="alice.bsky.social"');
    await expect(codeBlock).toContainText('embed.js');

    await qaScreenshot(page, 'embed-builder-filled');
  });

  test('shows live preview iframe', async ({ page }) => {
    await page.goto('/embed');

    const input = page.locator('#embed-identifier');
    await input.click();
    await input.fill('test.bsky.social');

    // Wait for React state to update and render the iframe
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 10000 });
    const src = await iframe.getAttribute('src');
    expect(src).toContain('/embed/test.bsky.social');
  });
});
