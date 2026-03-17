import { test as base, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Extended test fixture that adds accessibility scanning and
 * pre-QA screenshot capture to every test.
 *
 * Usage: import { test, expect } from '../fixtures/base';
 */

type AxeScanResult = Awaited<ReturnType<AxeBuilder['analyze']>>;

const QA_SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots');

type BaseFixtures = {
  /** Run an axe accessibility scan on the current page. Returns violations for assertion. */
  axeScan: (page: Page) => Promise<AxeScanResult>;
  /**
   * Capture a named screenshot for pre-QA evidence.
   * Screenshots are saved to `e2e/qa-screenshots/` and can be attached to PRs.
   * Only captures when `QA_SCREENSHOTS=1` is set (e.g. via `pnpm test:e2e:screenshots`).
   */
  qaScreenshot: (page: Page, name: string) => Promise<string | null>;
};

export const test = base.extend<BaseFixtures>({
  axeScan: async ({}, use) => {
    const scan = async (page: Page) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      return results;
    };
    await use(scan);
  },

  qaScreenshot: async ({}, use) => {
    const enabled = process.env.QA_SCREENSHOTS === '1';
    if (enabled) {
      fs.mkdirSync(QA_SCREENSHOTS_DIR, { recursive: true });
    }

    const capture = async (page: Page, name: string): Promise<string | null> => {
      if (!enabled) return null;

      const project = test.info().project.name;
      const fileName = `${name}-${project}.png`;
      const filePath = path.join(QA_SCREENSHOTS_DIR, fileName);
      await page.screenshot({ path: filePath, fullPage: true });
      return filePath;
    };
    await use(capture);
  },
});

export { expect } from '@playwright/test';
