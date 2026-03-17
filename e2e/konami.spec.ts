import { test, expect } from './fixtures/base';

test.describe('Konami code Easter egg', () => {
  // The Konami code only works with physical keyboard input
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Keyboard-only test, skip on mobile viewports',
  );

  test('activates overlay on correct key sequence', async ({ page }) => {
    test.skip(test.info().project.name.includes('mobile'), 'Keyboard Easter egg, desktop only');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // The konami code: ↑ ↑ ↓ ↓ ← → ← → b a
    const keys = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of keys) {
      await page.keyboard.press(key);
    }

    // Overlay should appear
    const overlay = page.locator('.fixed.inset-0.z-\\[9999\\]');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // Close button should be present
    const closeButton = page.locator('button[aria-label="Close"]');
    await expect(closeButton).toBeVisible();
  });

  test('dismisses overlay with Escape key', async ({ page }) => {
    test.skip(test.info().project.name.includes('mobile'), 'Keyboard Easter egg, desktop only');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const keys = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of keys) {
      await page.keyboard.press(key);
    }

    const overlay = page.locator('.fixed.inset-0.z-\\[9999\\]');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // Dismiss with Escape
    await page.keyboard.press('Escape');
    await expect(overlay).not.toBeVisible();
  });
});
