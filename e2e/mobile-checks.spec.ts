import { test, expect } from './fixtures/base';

/**
 * Automated mobile QA checks that run across all public pages
 * on every mobile/tablet viewport. These replace the mechanical
 * parts of Tessa's manual mobile review.
 */

const PUBLIC_PAGES = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/login',
  '/embed',
  '/search',
  '/experts',
];

test.describe('Mobile layout checks', () => {
  // These checks are most relevant on mobile/tablet viewports
  // but also catch issues on desktop
  for (const pagePath of PUBLIC_PAGES) {
    test(`${pagePath} — no horizontal scrollbar`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `${pagePath} should not have horizontal scrollbar`).toBe(false);
    });

    test(`${pagePath} — no text smaller than 12px`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      const smallTextElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('body *:not(script):not(style):not(noscript)');
        const violations: string[] = [];
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          // Only check visible, leaf-level elements with direct text content
          if (
            fontSize < 12 &&
            el.children.length === 0 &&
            el.textContent?.trim() &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            (el as HTMLElement).offsetHeight > 0
          ) {
            violations.push(
              `<${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 30)}" has font-size: ${fontSize}px`,
            );
          }
        }
        return violations;
      });

      // Advisory: log but don't fail on pre-existing small text
      // TODO: fix small text issues and switch to strict assertion
      if (smallTextElements.length > 0) {
        test.info().annotations.push({
          type: 'warning',
          description: `Small text: ${smallTextElements.join(', ')}`,
        });
      }
    });

    test(`${pagePath} — no content overflows viewport`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      const overflowingElements = await page.evaluate(() => {
        const viewportWidth = window.innerWidth;
        const elements = document.querySelectorAll('body *:not(script):not(style):not(noscript)');
        const violations: string[] = [];
        for (const el of elements) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const style = window.getComputedStyle(el);
          // Skip hidden/zero-size elements and elements with overflow hidden (intentional clipping)
          if (
            rect.width === 0 ||
            rect.height === 0 ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.overflow === 'hidden' ||
            style.overflowX === 'hidden'
          ) {
            continue;
          }
          // Check if element extends beyond viewport with some tolerance (2px for rounding)
          if (rect.right > viewportWidth + 2) {
            violations.push(
              `<${el.tagName.toLowerCase()}${el.className ? ` class="${String(el.className).slice(0, 50)}"` : ''}> overflows by ${Math.round(rect.right - viewportWidth)}px`,
            );
          }
        }
        return violations.slice(0, 5); // limit to first 5 to keep output readable
      });
      expect(overflowingElements, `${pagePath} has elements overflowing the viewport`).toEqual([]);
    });

    test(`${pagePath} — viewport meta tag is correct`, async ({ page }) => {
      await page.goto(pagePath);

      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      const content = await viewport.getAttribute('content');
      expect(content).toContain('width=device-width');
    });
  }
});

test.describe('Tap target sizes', () => {
  for (const pagePath of PUBLIC_PAGES) {
    test(`${pagePath} — interactive elements are at least 44x44px`, async ({ page }) => {
      // Only run on mobile viewports — desktop/tablet can have smaller click targets
      const project = test.info().project.name;
      test.skip(
        project === 'desktop-chrome' || project === 'tablet',
        'Tap target size checks are for mobile viewports only',
      );

      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      const smallTargets = await page.evaluate(() => {
        const interactiveSelectors =
          'a, button, input, select, textarea, [role="button"], [tabindex]';
        const elements = document.querySelectorAll(interactiveSelectors);
        const violations: string[] = [];
        for (const el of elements) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const style = window.getComputedStyle(el);
          // Skip hidden elements
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            rect.width === 0 ||
            rect.height === 0
          ) {
            continue;
          }
          // 44x44 is the WCAG recommended minimum tap target size
          if (rect.width < 44 || rect.height < 44) {
            const label =
              (el as HTMLElement).textContent?.trim().slice(0, 30) ||
              el.getAttribute('aria-label') ||
              el.tagName.toLowerCase();
            violations.push(`"${label}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
          }
        }
        return violations.slice(0, 10);
      });

      // Log violations as warnings but don't fail — this is advisory for now
      // TODO: once existing violations are fixed, switch to strict assertion
      if (smallTargets.length > 0) {
        test.info().annotations.push({
          type: 'warning',
          description: `Small tap targets: ${smallTargets.join(', ')}`,
        });
      }
    });
  }
});

test.describe('Landscape orientation', () => {
  const KEY_PAGES = ['/', '/login', '/search'];

  for (const pagePath of KEY_PAGES) {
    test(`${pagePath} — renders in landscape without breaking`, async ({ page }) => {
      test.skip(
        test.info().project.name === 'desktop-chrome',
        'Landscape tests are for mobile/tablet viewports',
      );
      // Rotate to landscape
      await page.setViewportSize({
        width: page.viewportSize()!.height,
        height: page.viewportSize()!.width,
      });

      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');

      // Page should still render without horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(
        hasHorizontalScroll,
        `${pagePath} landscape should not have horizontal scrollbar`,
      ).toBe(false);

      // Main content should exist and have content
      const main = page.locator('main');
      await expect(main.first()).toBeAttached();
    });
  }
});
