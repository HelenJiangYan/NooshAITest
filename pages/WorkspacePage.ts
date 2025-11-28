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
    this.sidebarMenu = page.locator('.sidebar, .side-nav, [role="navigation"]').first();
    this.projectList = page.locator('.project-list, .projects');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
    this.userProfile = page.locator('.user-profile, .user-menu').first();
  }

  async navigateToSection(sectionName: string) {
    const section = this.page.locator(`text=${sectionName}, [aria-label="${sectionName}"]`).first();
    await section.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchProject(projectName: string) {
    await this.searchInput.fill(projectName);
    await this.page.waitForTimeout(1000);
  }
}
