# 🎯 快速参考手册

## 🚀 快速命令

### 安装和设置
```bash
npm install                    # 安装依赖
npm run install:browsers       # 安装浏览器
cp .env.example .env          # 创建环境配置
```

### 运行测试
```bash
npm test                      # 运行所有测试
npm run test:smoke           # 冒烟测试
npm run test:regression      # 回归测试
npm run test:ai              # AI助手测试
npm run test:auth            # 登录测试
```

### 调试模式
```bash
npm run test:ui              # UI模式（推荐）
npm run test:headed          # 有界面模式
npm run test:debug           # Debug模式
npm run codegen              # 录制测试
```

### 查看报告
```bash
npm run report               # 打开HTML报告
```

## 📝 编写测试快速模板

### 基础测试模板
```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('功能模块测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('测试用例名称 @smoke', async ({ page }) => {
    // Arrange - 准备
    const element = page.locator('.selector');

    // Act - 执行
    await element.click();

    // Assert - 断言
    await expect(element).toBeVisible();
  });
});
```

### AI测试模板
```typescript
test('AI命令测试', async ({ page, aiAssistantPage, mcpHelper }) => {
  await page.goto('/workspace/chatbot');
  await aiAssistantPage.openAIAssistant();

  // 发送命令
  await mcpHelper.sendCommand('your command');
  await aiAssistantPage.waitForResponse();

  // 验证响应
  const response = await aiAssistantPage.getLastMessageText();
  expect(response).not.toBe('');
});
```

### 登录测试模板
```typescript
test('登录测试', async ({ loginPage, page }) => {
  await page.goto('/login');
  await loginPage.login('username', 'password');
  await expect(page).toHaveURL(/workspace/);
});
```

## 🔧 常用 API

### Page 对象
```typescript
await page.goto('/path')                    // 导航
await page.reload()                         // 刷新
await page.goBack()                         // 后退
await page.waitForLoadState('networkidle')  // 等待加载
await page.screenshot({ path: 'shot.png' }) // 截图
```

### Locator 操作
```typescript
const element = page.locator('.selector')

await element.click()                       // 点击
await element.fill('text')                  // 填充
await element.type('text')                  // 输入
await element.press('Enter')                // 按键
await element.check()                       // 勾选
await element.selectOption('value')         // 选择
```

### 等待方法
```typescript
await page.waitForSelector('.selector')     // 等待元素
await page.waitForURL('**/workspace/**')    // 等待URL
await page.waitForTimeout(1000)             // 等待时间
await element.waitFor({ state: 'visible' }) // 等待状态
```

### 断言
```typescript
await expect(page).toHaveURL(/pattern/)     // URL断言
await expect(element).toBeVisible()         // 可见性
await expect(element).toHaveText('text')    // 文本
await expect(element).toHaveCount(5)        // 数量
await expect(element).toBeEnabled()         // 可用性
```

## 🎭 选择器速查

### 常用选择器
```typescript
// 按角色
page.getByRole('button', { name: '登录' })

// 按文本
page.locator('text=登录')
page.locator('button:has-text("登录")')

// 按属性
page.locator('[data-testid="login-btn"]')
page.locator('input[type="password"]')

// 组合选择器
page.locator('button[type="submit"]:has-text("登录")')

// CSS选择器
page.locator('.class-name')
page.locator('#id-name')
```

### 层级选择器
```typescript
page.locator('.parent .child')              // 后代
page.locator('.parent > .child')            // 直接子元素
page.locator('.class:first-child')          // 第一个
page.locator('.class:last-child')           // 最后一个
```

## 🛠️ Fixtures 使用

```typescript
test('测试', async ({
  page,              // Playwright page对象
  loginPage,         // 登录页面对象
  aiAssistantPage,   // AI助手页面对象
  workspacePage,     // 工作区页面对象
  mcpHelper,         // MCP辅助工具
}) => {
  // 使用fixtures
});
```

## 📊 测试数据

```typescript
import {
  TestUsers,        // 测试用户
  AITestCommands,   // AI命令数据
  Timeouts,         // 超时配置
  URLs,             // URL配置
} from '../../fixtures/test-data';

// 使用
await loginPage.login(
  TestUsers.standard.username,
  TestUsers.standard.password
);
```

## 🏷️ 测试标签

```typescript
test('冒烟测试 @smoke', async () => {})
test('回归测试 @regression', async () => {})
test('性能测试 @performance', async () => {})

// 运行特定标签
npx playwright test --grep @smoke
```

## 🔍 调试技巧

### 暂停执行
```typescript
await page.pause()  // 暂停，打开Inspector
```

### 控制台输出
```typescript
console.log('当前URL:', page.url())
console.log('页面标题:', await page.title())
console.log('元素文本:', await element.textContent())
```

### 截图调试
```typescript
await page.screenshot({
  path: 'debug.png',
  fullPage: true
})
```

### Trace追踪
```typescript
// 配置文件中已启用失败时trace
// 在报告中点击查看
```

## ⚙️ 环境变量

```bash
# .env 文件
BASE_URL=https://nooshchat.qa2.noosh.com
TEST_USERNAME=your_username
TEST_PASSWORD=your_password
HEADLESS=false
AI_RESPONSE_TIMEOUT=10000
```

```typescript
// 代码中使用
process.env.BASE_URL
process.env.TEST_USERNAME
```

## 🚨 错误处理

### Try-Catch
```typescript
try {
  await element.click({ timeout: 2000 });
} catch (error) {
  console.error('点击失败:', error);
  await alternativeElement.click();
}
```

### 条件检查
```typescript
if (await element.isVisible()) {
  await element.click();
}

const count = await elements.count();
if (count > 0) {
  await elements.first().click();
}
```

## 📦 Page Object 创建

```typescript
export class MyPage {
  readonly page: Page;
  readonly button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.button = page.locator('button');
  }

  async clickButton() {
    await this.button.click();
  }

  async getButtonText(): Promise<string> {
    return await this.button.textContent() || '';
  }
}
```

## 🎬 测试钩子

```typescript
test.describe('测试套件', () => {
  test.beforeAll(async () => {
    // 所有测试前运行一次
  });

  test.beforeEach(async ({ page }) => {
    // 每个测试前运行
    await page.goto('/page');
  });

  test.afterEach(async ({ page }) => {
    // 每个测试后运行
    await page.screenshot({ path: 'after.png' });
  });

  test.afterAll(async () => {
    // 所有测试后运行一次
  });

  test('测试1', async () => {});
  test('测试2', async () => {});
});
```

## 🔄 并行和串行

```typescript
// 并行执行（默认）
test.describe('并行测试', () => {
  test('测试1', async () => {});
  test('测试2', async () => {});
});

// 串行执行
test.describe.serial('串行测试', () => {
  test('测试1', async () => {});
  test('测试2', async () => {});  // 等测试1完成后执行
});
```

## 📱 多浏览器测试

```bash
# 运行特定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=mobile-chrome
```

## 🔢 超时配置

```typescript
// 测试级别
test('测试', async ({ page }) => {
  test.setTimeout(60000);  // 60秒
});

// 操作级别
await element.click({ timeout: 5000 });
await page.waitForSelector('.el', { timeout: 10000 });
```

## 🎨 常见模式

### 登录一次，多次使用
```typescript
// global-setup.ts 已实现
// 所有测试自动使用认证状态
```

### 重试失败测试
```typescript
// playwright.config.ts
retries: 2  // 失败重试2次
```

### 条件跳过
```typescript
test.skip(condition, '跳过原因', async () => {});
test.fixme('待修复测试', async () => {});
```

## 📚 快速链接

- [完整文档](./README.md)
- [快速开始](./QUICK_START.md)
- [最佳实践](./BEST_PRACTICES.md)
- [项目概览](./PROJECT_OVERVIEW.md)
- [Playwright 官方文档](https://playwright.dev/)

---

**打印此页面，放在你的桌面！** 📄✨
