# Noosh AI 自动化测试框架

基于 Playwright + MCP 的 Noosh AI 系统自动化测试框架，支持 E2E 测试、AI 对话测试和集成测试。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [运行测试](#运行测试)
- [编写测试](#编写测试)
- [CI/CD集成](#cicd集成)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

## ✨ 功能特性

- ✅ **E2E 测试** - 完整的端到端用户流程测试
- ✅ **AI 对话测试** - 专门针对 AI Assistant 的命令和响应测试
- ✅ **MCP 集成** - Model Context Protocol 智能测试支持
- ✅ **多浏览器支持** - Chromium、Firefox、Webkit、移动端
- ✅ **Page Object Model** - 易维护的页面对象模式
- ✅ **智能等待机制** - 自动处理异步操作
- ✅ **截图和录屏** - 失败时自动保存
- ✅ **Trace 追踪** - 详细的执行追踪
- ✅ **CI/CD 就绪** - GitHub Actions 集成
- ✅ **测试报告** - HTML、JSON、JUnit 多格式报告

## 🛠 技术栈

- **Playwright** `^1.48.0` - 现代化的端到端测试框架
- **TypeScript** `^5.6.0` - 类型安全
- **MCP SDK** `^1.0.0` - Model Context Protocol 集成
- **Dotenv** - 环境变量管理
- **Allure** - 测试报告（可选）

## 📁 项目结构

```
noosh-ai-tests/
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD 配置
├── config/
│   ├── global-setup.ts             # 全局设置（登录认证）
│   └── global-teardown.ts          # 全局清理
├── fixtures/
│   ├── auth.fixture.ts             # 测试 fixtures
│   └── test-data.ts                # 测试数据
├── tests/
│   ├── auth/
│   │   └── login.spec.ts           # 登录测试
│   ├── ai-assistant/
│   │   └── commands.spec.ts        # AI 命令测试
│   ├── ui/                         # UI 测试
│   └── integration/
│       └── end-to-end.spec.ts      # 端到端测试
├── utils/
│   ├── mcp-helper.ts               # MCP 辅助工具
│   └── page-objects.ts             # 页面对象模型
├── test-results/                   # 测试结果输出
├── playwright-report/              # HTML 报告
├── .env                            # 环境变量配置
├── .env.example                    # 环境变量示例
├── playwright.config.ts            # Playwright 配置
├── tsconfig.json                   # TypeScript 配置
├── package.json                    # 项目依赖
└── README.md                       # 项目文档
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 2. 安装依赖

```bash
cd noosh-ai-tests
npm install
```

### 3. 安装浏览器

```bash
npm run install:browsers
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env` 并填入实际配置：

```bash
# 基础URL
BASE_URL=https://nooshchat.qa2.noosh.com

# 测试账号
TEST_USERNAME=dgo1g1mgr1
TEST_PASSWORD=noosh123

# 浏览器设置
HEADLESS=false
```

### 5. 运行测试

```bash
# 运行所有测试
npm test

# 运行冒烟测试
npm run test:smoke

# 运行 AI 助手测试
npm run test:ai

# 带界面运行（调试模式）
npm run test:headed

# UI 模式运行
npm run test:ui
```

## ⚙️ 配置说明

### 环境变量配置

在 `.env` 文件中配置：

```env
# 基础配置
BASE_URL=https://nooshchat.qa2.noosh.com
TEST_USERNAME=your_username
TEST_PASSWORD=your_password

# 超时设置（毫秒）
DEFAULT_TIMEOUT=30000
AI_RESPONSE_TIMEOUT=10000
AI_COMMAND_DELAY=1000

# 浏览器设置
HEADLESS=false            # true 为无头模式

# MCP 配置
MCP_ENABLED=true
MCP_SERVER_URL=http://localhost:3000

# 测试选项
RETRY_COUNT=2             # 失败重试次数
WORKERS=4                 # 并发数
```

### Playwright 配置

在 `playwright.config.ts` 中自定义：

```typescript
export default defineConfig({
  timeout: 30 * 1000,           // 测试超时
  retries: 1,                   // 重试次数
  workers: 4,                   // 并发数
  use: {
    baseURL: 'https://nooshchat.qa2.noosh.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

## 🧪 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx playwright test tests/auth/login.spec.ts

# 运行特定测试套件
npm run test:auth          # 登录测试
npm run test:ai            # AI 助手测试

# 运行带标签的测试
npm run test:smoke         # 冒烟测试 @smoke
npm run test:regression    # 回归测试 @regression
```

### 调试模式

```bash
# UI 模式（推荐）
npm run test:ui

# Debug 模式
npm run test:debug

# 带界面运行
npm run test:headed

# 单个测试 debug
npx playwright test tests/auth/login.spec.ts --debug
```

### 查看报告

```bash
# 查看 HTML 报告
npm run report

# 报告会在浏览器中自动打开
```

## 📝 编写测试

### 基本测试示例

```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('功能测试', () => {
  test('测试示例 @smoke', async ({ page, aiAssistantPage, mcpHelper }) => {
    // 访问页面
    await page.goto('/workspace/chatbot');

    // 打开 AI 助手
    await aiAssistantPage.openAIAssistant();

    // 发送命令
    await mcpHelper.sendCommand('help');
    await aiAssistantPage.waitForResponse();

    // 获取响应
    const response = await aiAssistantPage.getLastMessageText();

    // 断言
    expect(response).not.toBe('');
  });
});
```

### 使用 Page Objects

```typescript
test('使用页面对象', async ({ loginPage, aiAssistantPage }) => {
  // 登录
  await loginPage.goto();
  await loginPage.login('username', 'password');

  // 使用 AI 助手
  await aiAssistantPage.openAIAssistant();
  await aiAssistantPage.sendMessage('copy project');
});
```

### 使用测试数据

```typescript
import { TestUsers, AITestCommands } from '../../fixtures/test-data';

test('使用测试数据', async ({ loginPage, mcpHelper }) => {
  await loginPage.login(
    TestUsers.standard.username,
    TestUsers.standard.password
  );

  await mcpHelper.sendCommand(AITestCommands.project.copy);
});
```

## 🔄 CI/CD集成

### GitHub Actions

项目已配置 GitHub Actions，推送到 `main` 或 `develop` 分支时自动运行测试。

配置文件：`.github/workflows/playwright.yml`

### 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `BASE_URL` - 测试环境URL
- `TEST_USERNAME` - 测试用户名
- `TEST_PASSWORD` - 测试密码

### 手动触发

在 GitHub Actions 页面可以手动触发工作流运行。

### 定时运行

配置了每天自动运行回归测试（北京时间 08:00）。

## 💡 最佳实践

### 1. 测试设计

- ✅ 使用 `@smoke` 标签标记核心测试
- ✅ 使用 `@regression` 标签标记回归测试
- ✅ 每个测试应该独立，不依赖其他测试
- ✅ 使用有意义的测试名称
- ✅ 添加适当的 `console.log` 输出测试进度

### 2. 页面对象

- ✅ 将页面交互逻辑封装到 Page Objects
- ✅ 使用多个选择器以提高稳定性
- ✅ 避免在测试中直接使用选择器

### 3. 等待策略

- ✅ 使用 `waitForLoadState('networkidle')` 等待页面加载
- ✅ 使用 `waitForSelector` 等待元素出现
- ✅ 避免使用固定的 `waitForTimeout`，除非必要

### 4. 错误处理

- ✅ 使用 try-catch 处理预期的错误
- ✅ 失败时自动截图已配置
- ✅ 使用有意义的错误消息

### 5. 测试数据

- ✅ 集中管理测试数据在 `fixtures/test-data.ts`
- ✅ 使用环境变量管理敏感信息
- ✅ 避免硬编码测试数据

## 🐛 故障排除

### 问题：全局设置登录失败

**解决方案：**
1. 检查 `.env` 文件中的账号密码是否正确
2. 检查网络连接
3. 查看 `global-setup-error.png` 截图
4. 根据实际登录页面调整 `config/global-setup.ts` 中的选择器

### 问题：找不到 AI 输入框

**解决方案：**
1. 检查页面是否完全加载
2. 更新 `utils/mcp-helper.ts` 中的 `inputSelectors`
3. 使用 `npm run codegen` 录制正确的选择器

### 问题：AI 响应超时

**解决方案：**
1. 增加 `.env` 中的 `AI_RESPONSE_TIMEOUT` 值
2. 检查网络延迟
3. 验证 AI 服务是否正常

### 问题：测试不稳定

**解决方案：**
1. 增加 `AI_COMMAND_DELAY` 延迟
2. 使用更可靠的选择器（data-testid）
3. 添加更多的等待条件
4. 检查是否有异步操作未完成

### 问题：截图和视频未生成

**解决方案：**
1. 检查 `test-results/` 目录权限
2. 确认测试确实失败了（只有失败才截图）
3. 检查 `playwright.config.ts` 配置

## 📊 测试报告

### HTML 报告

```bash
npm run report
```

报告包含：
- ✅ 测试执行摘要
- ✅ 通过/失败统计
- ✅ 执行时间
- ✅ 截图和视频
- ✅ Trace 追踪

### 生成其他格式报告

测试结果自动生成：
- `test-results/results.json` - JSON 格式
- `test-results/junit.xml` - JUnit 格式

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- 项目维护: Noosh QA Team
- 问题反馈: [GitHub Issues](https://github.com/your-org/noosh-ai-tests/issues)

## 🎯 下一步计划

- [ ] 添加更多 AI 命令测试
- [ ] 集成 Allure 报告
- [ ] 添加 API 测试
- [ ] 添加性能测试
- [ ] 支持多环境配置
- [ ] 添加测试数据管理
- [ ] 集成 Slack 通知

---

**Happy Testing! 🚀**
