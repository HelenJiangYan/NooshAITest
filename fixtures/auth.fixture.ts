import { test as base, Page } from '@playwright/test';
import { LoginPage, AIAssistantPage, WorkspacePage } from '../utils/page-objects';
import { MCPHelper } from '../utils/mcp-helper';

/**
 * 自定义测试fixtures
 * 提供预配置的页面对象和工具类
 */

type MyFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  aiAssistantPage: AIAssistantPage;
  workspacePage: WorkspacePage;
  mcpHelper: MCPHelper;
};

/**
 * 扩展基础测试，添加自定义fixtures
 */
export const test = base.extend<MyFixtures>({
  // 已认证的页面 - 自动加载保存的登录状态
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'auth-state.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // 登录页面对象
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // AI助手页面对象
  aiAssistantPage: async ({ page }, use) => {
    const aiAssistantPage = new AIAssistantPage(page);
    await use(aiAssistantPage);
  },

  // 工作区页面对象
  workspacePage: async ({ page }, use) => {
    const workspacePage = new WorkspacePage(page);
    await use(workspacePage);
  },

  // MCP辅助工具
  mcpHelper: async ({ page }, use) => {
    const mcpHelper = new MCPHelper(page);
    await use(mcpHelper);
  },
});

export { expect } from '@playwright/test';
