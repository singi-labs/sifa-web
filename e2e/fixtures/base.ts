import { test as base, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Extended test fixture that adds accessibility scanning to every test.
 *
 * Usage: import { test, expect } from '../fixtures/base';
 */

type AxeScanResult = Awaited<ReturnType<AxeBuilder['analyze']>>;

type BaseFixtures = {
  /** Run an axe accessibility scan on the current page. Returns violations for assertion. */
  axeScan: (page: Page) => Promise<AxeScanResult>;
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
});

export { expect } from '@playwright/test';
