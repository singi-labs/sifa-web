import { type Page, type Locator } from '@playwright/test';

/** Page object for site-wide navigation elements. */
export class NavigationPage {
  readonly page: Page;
  readonly header: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.logo = page.locator('header a[href="/"]').first();
    this.navLinks = page.locator('nav a');
    this.footer = page.locator('footer');
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
