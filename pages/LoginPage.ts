import { Page, Locator } from '@playwright/test';

/**
 * 登录页面对象
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Updated selectors for Noosh login form
    this.usernameInput = page.locator(
      'input[name="j_username"], input#outlined-userid, input[name="username"], input[type="email"]'
    ).first();

    this.passwordInput = page.locator(
      'input[name="j_password"], input#outlined-adornment-password, input[name="password"], input[type="password"]'
    ).first();

    this.submitButton = page.locator(
      'button:has-text("Login"), button[type="submit"], button:has-text("登录")'
    ).first();

    this.errorMessage = page.locator(
      '.error-message, .alert-error, [role="alert"]'
    );
  }

  async goto() {
    await this.page.goto('/workspace/chatbot');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    // Step 1: 访问认证登录页面
    const authUrl = process.env.AUTH_URL || 'https://nooshauth.qa2.noosh.com';
    console.log(`📍 访问认证登录页面: ${authUrl}`);
    await this.page.goto(authUrl, { waitUntil: 'load', timeout: 30000 });

    // Wait for login form to be visible
    await this.usernameInput.waitFor({ state: 'visible', timeout: 15000 });

    // Step 2: 填写登录信息
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    // Step 3: 等待登录完成
    console.log('⏳ 等待登录完成...');
    await this.page.waitForTimeout(5000); // 给时间完成登录和跳转

    // Step 4: 跳转到应用主站（与 global-setup 保持一致）
    const baseUrl = process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com';
    console.log(`📍 跳转到应用主站: ${baseUrl}/workspace/chatbot`);
    await this.page.goto(`${baseUrl}/workspace/chatbot`, {
      waitUntil: 'networkidle',
      timeout: 45000
    });

    console.log(`✅ 登录成功，当前页面: ${this.page.url()}`);
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/workspace/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
