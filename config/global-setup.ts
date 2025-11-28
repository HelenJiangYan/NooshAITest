import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * 全局设置 - 在所有测试之前运行
 * 用于准备测试环境、认证状态等
 */
async function globalSetup(_config: FullConfig) {
  dotenv.config();

  console.log('🚀 开始全局设置...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 正在登录并保存认证状态...');

    // 访问授权登录页面
    const authUrl = process.env.AUTH_URL || 'https://nooshauth.qa2.noosh.com';
    console.log(`📍 访问授权登录页面: ${authUrl}`);

    await page.goto(authUrl, {
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

    console.log('⏳ 等待登录完成...');

    // 等待登录成功（页面会跳转）
    await page.waitForTimeout(5000); // 给时间完成登录和跳转

    // 登录成功后，跳转到应用主站
    const appUrl = process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com';
    console.log(`📍 跳转到应用主站: ${appUrl}/workspace/chatbot`);

    await page.goto(`${appUrl}/workspace/chatbot`, {
      waitUntil: 'networkidle',
      timeout: 45000
    });

    const finalUrl = page.url();
    console.log(`✅ 到达页面: ${finalUrl}`);

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
