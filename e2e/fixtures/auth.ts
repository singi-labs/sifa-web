import { test as base } from './base';
import fs from 'node:fs';
import path from 'node:path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

/**
 * Authentication fixture for Sifa E2E tests.
 *
 * ## How to set up authenticated screenshots
 *
 * Sifa uses AT Protocol OAuth -- there is no username/password form to automate.
 * Instead, we inject a real session cookie obtained from a manual login.
 *
 * Sessions live in PostgreSQL and last 180 days. They survive server restarts,
 * container rebuilds, and deployments. You only need to refresh this when the
 * 180-day TTL expires or if the sessions table is manually truncated.
 *
 * ### One-time setup
 * 1. Log in to sifa.id in your browser
 * 2. Open DevTools → Application → Cookies → copy the `session` cookie value
 * 3. Add to `.env.local`:  E2E_SESSION_COOKIE=<paste value here>
 * 4. Run:  pnpm test:e2e:setup-auth
 *    This writes `e2e/.auth/user.json` (gitignored).
 *
 * ### Refreshing (after 180 days)
 * Repeat the steps above. The old `e2e/.auth/user.json` will be overwritten.
 *
 * ### Running authenticated tests
 * Import from this fixture instead of base:
 *   import { test, expect } from '../fixtures/auth';
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

/** Parse the hostname for cookie domain. Strips port and leading dot. */
function cookieDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'localhost';
  }
}

export const test = base.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const fileName = path.resolve(AUTH_DIR, `${id}.json`);

      // Re-use an existing auth state file for this worker (avoids re-injecting
      // on every test). The file is written by pnpm test:e2e:setup-auth or on
      // first use when E2E_SESSION_COOKIE is set.
      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      fs.mkdirSync(AUTH_DIR, { recursive: true });

      const sessionCookie = process.env.E2E_SESSION_COOKIE;

      if (sessionCookie) {
        // Inject the real session cookie so authenticated pages render correctly.
        // The cookie must be set for both the web frontend and the API origin
        // because the API reads it server-to-server via middleware.
        const context = await browser.newContext({ storageState: undefined });

        const webDomain = cookieDomain(BASE_URL);
        const apiDomain = cookieDomain(API_URL);

        const cookieBase = {
          name: 'session',
          value: sessionCookie,
          httpOnly: true,
          secure: BASE_URL.startsWith('https'),
          sameSite: 'Lax' as const,
          path: '/',
          // 180 days from now -- matches the server-issued TTL
          expires: Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        };

        await context.addCookies([
          { ...cookieBase, domain: webDomain },
          ...(apiDomain !== webDomain ? [{ ...cookieBase, domain: apiDomain }] : []),
        ]);

        await context.storageState({ path: fileName });
        await context.close();
      } else {
        // No session cookie -- create an empty (unauthenticated) storage state.
        // Authenticated pages will redirect to /login; tests that require auth
        // will need E2E_SESSION_COOKIE set in .env.local.
        const context = await browser.newContext({ storageState: undefined });
        await context.storageState({ path: fileName });
        await context.close();
      }

      await use(fileName);
    },
    { scope: 'worker' },
  ],
});

export { expect } from './base';
