import { test, expect } from '../../../fixtures/auth.fixture';
import { TestUsers } from '../../../fixtures/test-data';

/**
 * 登录功能测试套件
 * @smoke 冒烟测试
 */
test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/workspace/chatbot');
  });

  test('成功登录 - 标准用户 @smoke', async ({ loginPage, page }) => {
    // 执行登录
    await loginPage.login(TestUsers.standard.username, TestUsers.standard.password);

    // 验证登录成功
    await expect(page).toHaveURL(/.*workspace.*/);
    expect(await loginPage.isLoginSuccessful()).toBeTruthy();

    // 验证用户已登录的UI元素
    await expect(page.locator('.user-profile, .user-menu')).toBeVisible();
  });

  test('登录失败 - 错误密码', async ({ loginPage }) => {
    await loginPage.usernameInput.fill(TestUsers.standard.username);
    await loginPage.passwordInput.fill('wrongpassword');
    await loginPage.submitButton.click();

    // 验证显示错误消息
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });

    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toMatch(/错误|invalid|incorrect|失败/);
  });

  test('登录表单UI验证', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();

    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.passwordInput).toBeEditable();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('登录性能测试 @performance', async ({ loginPage }) => {
    const startTime = Date.now();

    await loginPage.login(TestUsers.standard.username, TestUsers.standard.password);

    const endTime = Date.now();
    const loginTime = endTime - startTime;

    expect(loginTime).toBeLessThan(15000);
    console.log(`登录耗时: ${loginTime}ms`);
  });
});
