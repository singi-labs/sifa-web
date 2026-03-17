import { test as base } from './base';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

/**
 * Authentication fixture for Sifa E2E tests.
 *
 * Currently provides an unauthenticated base. When OAuth test accounts are
 * configured, implement the login flow in the workerStorageState fixture.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Playwright's extend API requires {} for "no test fixtures"
export const test = base.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use) => {
      if (process.env.PLAYWRIGHT_TEST_USER_HANDLE) {
        throw new Error(
          'Authenticated E2E tests are not yet implemented. ' +
            'Remove PLAYWRIGHT_TEST_USER_HANDLE or implement the OAuth login flow in e2e/fixtures/auth.ts.',
        );
      }

      const id = test.info().parallelIndex;
      const fileName = path.resolve(AUTH_DIR, `${id}.json`);

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      fs.mkdirSync(AUTH_DIR, { recursive: true });

      const context = await browser.newContext({ storageState: undefined });
      await context.storageState({ path: fileName });
      await context.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});

export { expect } from './base';
