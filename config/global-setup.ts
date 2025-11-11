import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * 全局设置 - 在所有测试之前运行
 * 用于准备测试环境、认证状态等
 */
async function globalSetup(config: FullConfig) {
  dotenv.config();

  console.log('🚀 开始全局设置...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 正在登录并保存认证状态...');

    await page.goto(process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com/workspace/chatbot', {
      waitUntil: 'load',
      timeout: 60000
    });

    // Wait for any redirects to complete (e.g., to auth.noosh.com)
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 填写登录信息 - 基于实际的Noosh登录表单结构
    const usernameSelector = 'input[name="j_username"], input#outlined-userid';
    const passwordSelector = 'input[name="j_password"], input#outlined-adornment-password';
    const submitSelector = 'button:has-text("Login")';

    // Wait for login form to be visible (with more generous timeout for redirects)
    console.log(`当前URL: ${page.url()}`);

    try {
      await page.waitForSelector(usernameSelector, { state: 'visible', timeout: 45000 });
    } catch (error) {
      console.log('无法找到用户名输入框，正在保存调试截图和HTML...');
      await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
      const html = await page.content();
      const fs = require('fs');
      fs.writeFileSync('debug-login-page.html', html);
      throw new Error(`找不到登录表单。当前URL: ${page.url()}。请检查 debug-login-page.png 和 debug-login-page.html`);
    }

    await page.fill(usernameSelector, process.env.TEST_USERNAME || 'dgo1g1mgr1');
    await page.fill(passwordSelector, process.env.TEST_PASSWORD || 'noosh123');
    await page.click(submitSelector);

    // 等待导航完成 - 可能会经过多个重定向
    // Sometimes the redirect chain is complex, so we wait and then manually navigate
    try {
      await page.waitForURL('**/workspace/**', { timeout: 30000 });
    } catch (error) {
      // If we're stuck on a redirect, try navigating directly to the workspace
      console.log('⚠️  重定向超时，尝试直接导航到工作区...');
      await page.goto(process.env.BASE_URL + '/workspace/dashboard', { timeout: 30000 });
    }

    // 保存认证状态
    await context.storageState({ path: 'auth-state.json' });

    console.log('✅ 认证状态已保存到 auth-state.json');

  } catch (error) {
    console.error('❌ 全局设置失败:', error);
    await page.screenshot({ path: 'global-setup-error.png' });
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  console.log('✅ 全局设置完成\n');
}

export default globalSetup;
