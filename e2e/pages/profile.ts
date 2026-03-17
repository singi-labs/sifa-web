import { type Page, type Locator } from '@playwright/test';

/** Page object for profile pages (/p/:handle). */
export class ProfilePage {
  readonly page: Page;
  readonly identityCard: Locator;
  readonly displayName: Locator;
  readonly handle: Locator;
  readonly avatar: Locator;
  readonly sectionNav: Locator;
  readonly aboutSection: Locator;
  readonly skillsSection: Locator;
  readonly experienceSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.identityCard = page.locator('[data-testid="identity-card"]');
    this.displayName = page.locator('[data-testid="display-name"]');
    this.handle = page.locator('[data-testid="handle"]');
    this.avatar = page.locator('[data-testid="avatar"]');
    this.sectionNav = page.locator('[data-testid="section-nav"]');
    this.aboutSection = page.locator('[data-testid="about-section"]');
    this.skillsSection = page.locator('[data-testid="skills-section"]');
    this.experienceSection = page.locator('[data-testid="experience-section"]');
  }

  async goto(handle: string) {
    await this.page.goto(`/p/${handle}`);
  }

  async waitForProfile() {
    await this.identityCard.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Open a kebab menu on a profile entry and click an action. */
  async clickKebabAction(entryLocator: Locator, actionName: string) {
    const kebab = entryLocator.locator('[data-testid="kebab-menu"]');
    await kebab.click();
    await this.page.getByRole('menuitem', { name: actionName }).click();
  }
}
