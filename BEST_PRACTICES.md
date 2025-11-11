# 📚 测试最佳实践

Noosh AI 测试框架的最佳实践和编码规范。

## 🎯 测试设计原则

### 1. FIRST 原则

- **F**ast - 快速执行
- **I**ndependent - 独立运行
- **R**epeatable - 可重复
- **S**elf-validating - 自我验证
- **T**imely - 及时编写

### 2. 测试金字塔

```
        /\
       /  \      E2E Tests (少量)
      /____\
     /      \    Integration Tests (适量)
    /________\
   /          \  Unit Tests (大量)
  /__________\
```

**我们的测试分布：**
- 冒烟测试 (@smoke): 5-10个核心流程
- 集成测试: 覆盖主要功能
- E2E测试: 完整用户场景

## ✍️ 编写测试

### 测试命名规范

```typescript
// ✅ 好的命名
test('成功登录 - 标准用户 @smoke', async () => {});
test('AI助手返回项目列表', async () => {});
test('登录失败 - 错误密码显示提示', async () => {});

// ❌ 不好的命名
test('test1', async () => {});
test('login', async () => {});
test('it works', async () => {});
```

**命名规则：**
- 使用中文描述功能
- 包含测试场景
- 包含预期结果
- 添加测试标签

### 测试结构 (AAA模式)

```typescript
test('测试示例', async ({ page }) => {
  // Arrange - 准备
  await page.goto('/workspace');
  const username = TestUsers.standard.username;

  // Act - 执行
  await loginPage.login(username, password);

  // Assert - 断言
  await expect(page).toHaveURL(/workspace/);
  expect(await loginPage.isLoginSuccessful()).toBeTruthy();
});
```

### 使用标签组织测试

```typescript
// 冒烟测试 - 最核心功能
test('登录测试 @smoke', async () => {});

// 回归测试 - 完整测试集
test('完整流程测试 @regression', async () => {});

// 性能测试
test('响应时间测试 @performance', async () => {});

// 跳过测试
test.skip('暂时跳过的测试', async () => {});

// 仅运行此测试
test.only('单独运行此测试', async () => {});
```

## 🔧 Fixtures 使用

### 使用自定义 Fixtures

```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test('使用fixtures', async ({
  page,              // Playwright page
  loginPage,         // 登录页面对象
  aiAssistantPage,   // AI助手页面对象
  workspacePage,     // 工作区页面对象
  mcpHelper,         // MCP辅助工具
}) => {
  // 直接使用，无需初始化
  await loginPage.goto();
  await mcpHelper.sendCommand('help');
});
```

### 使用认证状态

```typescript
// 自动使用保存的登录状态
test('已登录测试', async ({ page }) => {
  // 直接访问需要登录的页面
  await page.goto('/workspace/dashboard');
  // 无需手动登录，global-setup 已处理
});
```

## 📄 Page Object Model

### 创建 Page Object

```typescript
export class MyPage {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator('.my-element');
  }

  async performAction() {
    await this.element.click();
  }

  async getValue(): Promise<string> {
    return await this.element.textContent() || '';
  }
}
```

### 使用多选择器提高稳定性

```typescript
// ✅ 好的做法 - 多个备选选择器
this.submitButton = page.locator(
  'button[type="submit"], button:has-text("登录"), button:has-text("Login")'
).first();

// ❌ 不好的做法 - 单一脆弱选择器
this.submitButton = page.locator('button:nth-child(3)');
```

## ⏱️ 等待策略

### 智能等待

```typescript
// ✅ 好的做法
await page.waitForLoadState('networkidle');
await element.waitFor({ state: 'visible' });
await expect(element).toBeVisible();

// ❌ 避免使用固定延迟
await page.waitForTimeout(5000);  // 除非必要
```

### 等待优先级

1. `waitForLoadState` - 等待页面加载
2. `waitForSelector` - 等待元素
3. `waitForResponse` - 等待网络请求
4. `waitForTimeout` - 最后选择

### 超时配置

```typescript
// 使用配置的超时
import { Timeouts } from '../fixtures/test-data';

await element.waitFor({ timeout: Timeouts.medium });
await mcpHelper.sendCommand('help', Timeouts.aiResponse);
```

## 🎭 选择器最佳实践

### 选择器优先级

1. **data-testid** (最佳)
   ```typescript
   page.locator('[data-testid="login-button"]')
   ```

2. **role + name** (推荐)
   ```typescript
   page.getByRole('button', { name: '登录' })
   ```

3. **text** (可用)
   ```typescript
   page.locator('text=登录')
   ```

4. **class/id** (避免)
   ```typescript
   page.locator('.btn-primary')  // 可能会变
   ```

5. **nth-child** (避免)
   ```typescript
   page.locator('button:nth-child(3)')  // 很脆弱
   ```

### 动态选择器

```typescript
// 灵活的选择器函数
async findInput(placeholder: string) {
  return this.page.locator(
    `input[placeholder*="${placeholder}"],
     textarea[placeholder*="${placeholder}"]`
  ).first();
}
```

## 🔍 断言最佳实践

### 使用明确的断言

```typescript
// ✅ 好的断言
await expect(page).toHaveURL(/workspace/);
await expect(element).toBeVisible();
await expect(element).toHaveText('成功');
await expect(element).toHaveCount(5);

// ❌ 不明确的断言
expect(await element.isVisible()).toBeTruthy();
```

### 自定义错误消息

```typescript
expect(response, '响应不应为空').not.toBe('');
expect(count, '项目数量应大于0').toBeGreaterThan(0);
```

### 软断言（不中断测试）

```typescript
await expect.soft(element1).toBeVisible();
await expect.soft(element2).toBeVisible();
// 即使element1断言失败，仍会检查element2
```

## 📊 测试数据管理

### 集中管理测试数据

```typescript
// fixtures/test-data.ts
export const TestData = {
  users: {
    standard: { username: 'user1', password: 'pass1' },
    admin: { username: 'admin', password: 'admin123' },
  },
  commands: {
    help: 'help',
    copyProject: 'copy project',
  },
};

// 在测试中使用
await login(TestData.users.standard.username, TestData.users.standard.password);
```

### 使用环境变量

```typescript
// 敏感数据放在环境变量
const username = process.env.TEST_USERNAME || 'default';
const apiKey = process.env.API_KEY;
```

### 测试数据清理

```typescript
test.afterEach(async ({ page }) => {
  // 清理测试创建的数据
  await cleanupTestData();
});
```

## 🐛 错误处理

### 预期错误的处理

```typescript
try {
  await element.click({ timeout: 2000 });
} catch (error) {
  // 尝试备选方案
  await alternativeElement.click();
}
```

### 失败时添加上下文

```typescript
test('复杂测试', async ({ page }) => {
  try {
    // 测试步骤
    await step1();
    await step2();
    await step3();
  } catch (error) {
    // 添加调试信息
    console.error('失败的URL:', page.url());
    console.error('页面标题:', await page.title());

    // 额外截图
    await page.screenshot({
      path: 'debug-screenshot.png',
      fullPage: true
    });

    throw error;
  }
});
```

## 🎬 AI 测试最佳实践

### 发送命令

```typescript
// ✅ 好的做法
await mcpHelper.sendCommand('copy project');
await aiAssistantPage.waitForResponse(Timeouts.aiResponse);
const response = await aiAssistantPage.getLastMessageText();

// 验证响应
expect(response).not.toBe('');
expect(response.length).toBeGreaterThan(0);
```

### 验证 AI 响应

```typescript
// 关键词验证
const hasKeywords = mcpHelper.validateResponse(
  ['成功', 'success', '完成'],
  response
);

// 或使用正则
expect(response).toMatch(/成功|success|完成/i);
```

### 多轮对话

```typescript
// 保持对话上下文
await mcpHelper.sendCommand('list projects');
await aiAssistantPage.waitForResponse();

await mcpHelper.sendCommand('copy the first one');
await aiAssistantPage.waitForResponse();
// AI 应该理解"the first one"指的是第一个项目
```

## 📈 性能优化

### 并行执行

```typescript
// 合理设置 workers
// playwright.config.ts
workers: process.env.CI ? 2 : 4,
```

### 减少等待时间

```typescript
// 使用 Promise.all 并行操作
await Promise.all([
  page.waitForNavigation(),
  button.click(),
]);
```

### 复用认证状态

```typescript
// 使用 global-setup 一次登录，所有测试复用
// 已在框架中实现
```

## 🔐 安全最佳实践

### 不要在代码中硬编码密码

```typescript
// ❌ 不好
const password = 'mypassword123';

// ✅ 好
const password = process.env.TEST_PASSWORD;
```

### 不要提交敏感文件

```bash
# .gitignore 已配置
.env
auth-state.json
```

## 📝 文档和注释

### 添加有意义的注释

```typescript
/**
 * 测试用户登录后访问AI助手功能
 * 验证：
 * 1. 登录成功
 * 2. AI助手按钮可见
 * 3. 可以发送命令
 * 4. 收到响应
 */
test('AI助手完整流程', async () => {
  // 步骤 1: 登录
  console.log('Step 1: 登录系统');
  await loginPage.login(username, password);

  // 步骤 2: 打开AI助手
  console.log('Step 2: 打开AI助手');
  await aiAssistantPage.openAIAssistant();

  // ... 更多步骤
});
```

### 使用 console.log 跟踪进度

```typescript
console.log('✓ 登录成功');
console.log('⏳ 等待AI响应...');
console.log(`✓ 收到响应: ${response.substring(0, 50)}...`);
```

## 🚀 CI/CD 最佳实践

### 分层测试

```yaml
# 快速反馈 - PR时运行
- npm run test:smoke

# 完整测试 - 定时运行
- npm test
```

### 保留失败产物

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: test-results/
```

## 📋 Code Review 检查清单

- [ ] 测试名称清晰描述功能
- [ ] 添加适当的测试标签
- [ ] 使用 Page Object 而非直接选择器
- [ ] 适当的等待策略
- [ ] 有意义的断言消息
- [ ] 错误处理完善
- [ ] 测试数据外部化
- [ ] 添加必要的注释
- [ ] 测试独立可重复
- [ ] 执行时间合理

---

**遵循这些最佳实践，让测试更可靠、更易维护！** ✨
