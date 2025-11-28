import { Page, Locator } from '@playwright/test';

/**
 * 工作区页面对象
 */
export class WorkspacePage {
  readonly page: Page;
  readonly sidebarMenu: Locator;
  readonly projectList: Locator;
  readonly searchInput: Locator;
  readonly userProfile: Locator;

  constructor(page: Page) {
    this.page = page;

    // User-facing selectors for Noosh workspace
    this.sidebarMenu = page.getByRole('navigation')
      .or(page.locator('.sidebar, .side-nav'))
      .first();

    this.projectList = page.getByRole('list', { name: /project|项目/i })
      .or(page.locator('.project-list, .projects'));

    this.searchInput = page.getByRole('searchbox')
      .or(page.getByPlaceholder(/search|搜索/i))
      .or(page.locator('input[type="search"]'))
      .first();

    this.userProfile = page.getByRole('button', { name: /profile|user|用户/i })
      .or(page.locator('.user-profile, .user-menu'))
      .first();
  }

  async navigateToSection(sectionName: string) {
    // Use user-facing navigation
    const section = this.page.getByRole('link', { name: sectionName })
      .or(this.page.getByRole('button', { name: sectionName }))
      .or(this.page.getByLabel(sectionName))
      .first();
    await section.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchProject(projectName: string) {
    await this.searchInput.fill(projectName);
    await this.page.waitForTimeout(1000);
  }
}
