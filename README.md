# Noosh AI 自动化测试框架

基于 Playwright + MCP 的 Noosh AI 系统自动化测试框架，采用**分层测试策略**，支持 E2E 测试、MCP 集成测试和 AI 对话测试。

[![Playwright Tests](https://img.shields.io/badge/Playwright-v1.48.0-green)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.6.0-blue)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP-v1.0.0-orange)](https://spec.modelcontextprotocol.io/)

---

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [测试分层架构](#测试分层架构)
- [运行测试](#运行测试)
- [MCP 测试配置](#mcp-测试配置)
- [测试报告](#测试报告)
- [编写测试](#编写测试)
- [CI/CD集成](#cicd集成)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

---

## ✨ 功能特性

### 核心功能
- ✅ **分层测试架构** - E2E 层 + 集成层，快速定位问题
- ✅ **MCP 协议测试** - 26 个测试用例覆盖工具调用、资源访问、协议合规性
- ✅ **AI 对话测试** - 多轮对话、命令响应、上下文管理测试
- ✅ **E2E 测试** - 完整的端到端用户流程测试
- ✅ **Page Object Model** - 易维护的页面对象模式
- ✅ **智能等待机制** - 自动处理 AI 加载状态和异步操作

### 测试能力
- ✅ **多浏览器支持** - Chromium、Firefox、Webkit
- ✅ **并发执行** - 支持多 worker 并行测试
- ✅ **失败重试** - 自动重试不稳定的测试
- ✅ **截图和录屏** - 失败时自动保存
- ✅ **Trace 追踪** - 详细的执行追踪和回放

### 测试报告
- ✅ **Allure Report** - 精美的可视化测试报告（支持中文）
- ✅ **HTML Report** - Playwright 原生报告
- ✅ **JSON/JUnit** - CI/CD 集成格式

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Playwright** | `^1.48.0` | E2E 测试框架 |
| **TypeScript** | `^5.6.0` | 类型安全 |
| **@modelcontextprotocol/sdk** | `^1.21.0` | MCP 协议集成 |
| **allure-playwright** | `^3.0.0` | 测试报告生成 |
| **dotenv** | `^16.4.0` | 环境变量管理 |
| **axios** | `^1.7.0` | HTTP 请求 |

---

## 📁 项目结构

```
noosh-ai-tests/
├── .github/
│   └── workflows/
│       └── playwright.yml              # CI/CD 配置
│
├── config/
│   ├── global-setup.ts                 # 全局设置（自动登录）
│   └── global-teardown.ts              # 全局清理（测试摘要）
│
├── fixtures/
│   ├── auth.fixture.ts                 # 认证 fixture
│   ├── test-data.ts                    # 通用测试数据
│   └── conversation-test-data.ts       # 对话测试场景数据
│
├── utils/
│   ├── page-objects.ts                 # 页面对象模型（登录、AI助手）
│   ├── conversation-manager.ts         # 对话管理器
│   └── mcp-helper.ts                   # MCP 命令助手
│
├── tests/                              # ⭐ 分层测试目录
│   ├── e2e/                            # 📱 E2E 端到端测试
│   │   ├── auth/
│   │   │   └── login.spec.ts           # 登录功能测试
│   │   ├── ai-assistant/
│   │   │   ├── commands.spec.ts        # AI 命令测试
│   │   │   └── multi-turn-conversations.spec.ts  # 多轮对话测试
│   │   └── workflows/
│   │       └── user-workflows.spec.ts  # 用户工作流测试
│   │
│   └── integration/                    # ⚡ 集成测试
│       ├── mcp/                        # MCP 协议测试（26个用例）
│       │   ├── tool-invocation.spec.ts       # 工具调用测试
│       │   ├── resource-access.spec.ts       # 资源访问测试
│       │   └── protocol-compliance.spec.ts   # 协议合规性测试
│       └── api/                        # API 测试（预留）
│           └── .gitkeep
│
├── docs/
│   └── MCP_SETUP_GUIDE.md              # MCP 配置详细指南
│
├── test-results/                       # 测试结果输出
├── playwright-report/                  # HTML 报告
├── allure-results/                     # Allure 原始数据
├── allure-report/                      # Allure 报告
│
├── .env                                # 环境变量配置（不提交）
├── .env.example                        # 环境变量示例
├── playwright.config.ts                # Playwright 配置
├── tsconfig.json                       # TypeScript 配置
├── package.json                        # 项目依赖
├── MCP_QUICKSTART.md                   # MCP 快速开始指南
└── README.md                           # 本文档
```

---

## 🚀 快速开始

### 1. 环境要求

- **Node.js** >= 16.x (推荐 18.x+)
- **npm** >= 8.x

### 2. 安装依赖

```bash
git clone <repository-url>
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
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**最小配置**（必填项）：
```env
# 基础URL
BASE_URL=https://nooshchat.qa2.noosh.com

# 测试账号
TEST_USERNAME=your_username
TEST_PASSWORD=your_password

# 浏览器设置
HEADLESS=false
```

### 5. 运行测试

```bash
# 运行所有测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 运行冒烟测试
npm run test:smoke

# UI 模式运行（推荐调试）
npm run test:ui
```

### 6. 查看测试报告

```bash
# 查看 Allure 报告（推荐）
npm run allure:serve

# 查看 HTML 报告
npm run report
```

---

## 🎯 测试分层架构

本项目采用**测试金字塔**策略，按照测试范围和执行速度分为两层：

```
        /\
       /  \  E2E Tests (UI 层)
      /----\  4 个测试文件 | 慢速 | 全面
     /      \
    / MCP +  \  Integration Tests (集成层)
   /   API    \  26 个测试用例 | 快速 | 精准
  /------------\
```

### 📱 E2E 测试层 (`tests/e2e/`)

**测试范围**: 完整用户流程（UI + 后端 + 数据库）
**执行速度**: 慢（分钟级）
**测试数量**: ~15 个测试用例

**目录结构**:
- `e2e/auth/` - 认证测试（登录、登出）
- `e2e/ai-assistant/` - AI 助手功能测试
- `e2e/workflows/` - 完整工作流测试

**运行命令**:
```bash
npm run test:e2e              # 运行所有 E2E 测试
npm run test:e2e:auth         # 仅认证测试
npm run test:e2e:ai           # 仅 AI 助手测试
npm run test:e2e:workflows    # 仅工作流测试
```

### ⚡ 集成测试层 (`tests/integration/`)

**测试范围**: 模块间交互（MCP 协议、API 端点）
**执行速度**: 快（秒级）
**测试数量**: 26 个测试用例

**MCP 测试覆盖**:
- ✅ **工具调用测试** (12个) - 工具列表、参数验证、错误处理、性能
- ✅ **资源访问测试** (6个) - 资源列表、内容读取、权限控制、订阅
- ✅ **协议合规性测试** (8个) - 握手、能力声明、版本兼容、并发

**运行命令**:
```bash
npm run test:integration     # 运行所有集成测试
npm run test:mcp             # 仅 MCP 协议测试
npm run test:api             # 仅 API 测试（未来）
```

**详细说明**: 查看 [tests/README.md](tests/README.md)

---

## 🧪 运行测试

### 按层级运行

```bash
# E2E 测试（完整用户流程）
npm run test:e2e

# 集成测试（MCP 协议）
npm run test:integration

# MCP 测试
npm run test:mcp
```

### 按功能运行

```bash
# 认证测试
npm run test:auth

# AI 助手测试
npm run test:ai

# 冒烟测试（核心功能）
npm run test:smoke

# 回归测试（完整验证）
npm run test:regression
```

### 调试模式

```bash
# UI 模式（推荐）- 可视化调试
npm run test:ui

# Debug 模式 - 逐步执行
npm run test:debug

# 带浏览器界面运行
npm run test:headed

# 单个测试文件 debug
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### 高级选项

```bash
# 指定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox

# 指定 worker 数量
npx playwright test --workers=2

# 只运行失败的测试
npx playwright test --last-failed

# 运行特定标签的测试
npx playwright test --grep @smoke
npx playwright test --grep @mcp

# 排除特定标签
npx playwright test --grep-invert @performance
```

---

## 🔧 MCP 测试配置

### 快速配置（3 步启用）

#### 步骤 1: 编辑 .env 文件

在 `.env` 文件中添加：

```bash
# MCP 服务器路径（必填）
MCP_SERVER_PATH=C:\your\mcp\server\path  # Windows
# MCP_SERVER_PATH=/home/user/mcp-server  # Linux/Mac
```

#### 步骤 2: 配置启动命令（可选）

```bash
# Node.js 服务器（默认）
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./mcp-server/index.js

# Python 服务器
# MCP_SERVER_COMMAND=python3
# MCP_SERVER_ARGS=./src/server.py
```

#### 步骤 3: 运行 MCP 测试

```bash
npm run test:mcp
```

### 完整配置选项

```bash
# 必填配置
MCP_SERVER_PATH=C:\your\mcp\server\path

# 可选配置
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./mcp-server/index.js
MCP_TEST_TOOL_NAME=search_knowledge
MCP_TEST_TOOL_ARGS={"query":"测试","max_results":5}
MCP_SUPPORTS_LOGGING=false
MCP_SUPPORTS_SUBSCRIPTIONS=false
```

### 验证配置

```bash
# 检查环境变量
node -e "require('dotenv').config(); console.log('MCP_SERVER_PATH:', process.env.MCP_SERVER_PATH)"

# 运行测试
npm run test:mcp -- --reporter=list
```

**详细指南**:
- 快速开始: [MCP_QUICKSTART.md](MCP_QUICKSTART.md) ⭐ 推荐
- 完整指南: [docs/MCP_SETUP_GUIDE.md](docs/MCP_SETUP_GUIDE.md)

---

## 📊 测试报告

### Allure Report（推荐）

精美的可视化报告，支持中文分类和环境信息。

```bash
# 运行测试并查看报告
npm run test:allure

# 仅生成报告（基于已有结果）
npm run allure:generate

# 打开报告
npm run allure:open

# 启动报告服务器
npm run allure:serve

# 清理报告
npm run allure:clean
```

**报告特性**:
- ✅ 测试执行趋势图
- ✅ 按分类查看（UI测试失败、API测试失败）
- ✅ 环境信息（Node版本、环境、基础URL）
- ✅ 失败截图和视频
- ✅ 执行时间统计

### HTML Report

Playwright 原生报告。

```bash
npm run report
```

### 其他格式

测试自动生成：
- `test-results/results.json` - JSON 格式
- `test-results/junit.xml` - JUnit 格式（CI/CD）

---

## 📝 编写测试

### E2E 测试示例

```typescript
import { test, expect } from '../../../fixtures/auth.fixture';
import { ConversationManager } from '../../../utils/conversation-manager';

test.describe('AI 助手测试 @smoke', () => {
  test('应正确响应用户命令', async ({ page }) => {
    const manager = new ConversationManager(page);

    // 发送消息
    await manager.sendMessage('你好');

    // 等待响应
    const response = await manager.waitForResponse();

    // 验证响应
    expect(response).not.toBe('');
    expect(response).toContain('你好');
  });
});
```

### MCP 集成测试示例

```typescript
import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test.describe('MCP 工具调用测试 @integration @mcp', () => {
  test('应成功调用工具', async () => {
    const transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || 'node',
      args: process.env.MCP_SERVER_ARGS?.split(',') || ['./mcp-server/index.js'],
    });

    const client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    const result = await client.callTool({
      name: 'search_knowledge',
      arguments: { query: '测试', max_results: 5 }
    });

    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);

    await client.close();
  });
});
```

### 使用测试数据

```typescript
import { TestUsers, AITestCommands } from '../../../fixtures/test-data';

test('使用测试数据', async ({ loginPage }) => {
  await loginPage.login(
    TestUsers.standard.username,
    TestUsers.standard.password
  );
});
```

### 测试标签

```typescript
test('登录测试 @smoke', async ({ page }) => { ... });
test('复杂流程 @regression', async ({ page }) => { ... });
test('MCP 工具 @integration @mcp', async () => { ... });
test('性能测试 @performance', async () => { ... });
```

**标签说明**:
- `@smoke` - 冒烟测试（核心功能）
- `@regression` - 回归测试（完整验证）
- `@integration` - 集成测试
- `@mcp` - MCP 协议测试
- `@performance` - 性能测试
- `@security` - 安全测试

---

## 🔄 CI/CD 集成

### GitHub Actions

项目已配置 GitHub Actions，推送到 `main` 或 `develop` 分支时自动运行测试。

**配置文件**: `.github/workflows/playwright.yml`

### 配置 Secrets

在 GitHub 仓库设置中添加：

- `BASE_URL` - 测试环境 URL
- `TEST_USERNAME` - 测试用户名
- `TEST_PASSWORD` - 测试密码
- `MCP_SERVER_PATH` - MCP 服务器路径（可选）

### 手动触发

在 GitHub Actions 页面可手动触发工作流。

### 定时运行

配置了定时任务（可在 `playwright.yml` 中调整）。

---

## 💡 最佳实践

### 1. 测试设计原则

- ✅ **独立性**: 每个测试应独立运行，不依赖其他测试
- ✅ **幂等性**: 多次运行结果一致
- ✅ **原子性**: 一个测试只验证一个功能点
- ✅ **可读性**: 使用清晰的测试名称和注释

### 2. 选择合适的测试层级

- 🔧 **协议和工具验证** → MCP 集成测试（快速）
- 👤 **用户界面验证** → E2E 测试（全面）
- 🏗️ **组件交互验证** → 集成测试

### 3. 页面对象模式

```typescript
// ✅ 好的做法
await loginPage.login(username, password);

// ❌ 避免的做法
await page.fill('#username', username);
await page.fill('#password', password);
await page.click('button[type="submit"]');
```

### 4. 智能等待

```typescript
// ✅ 使用 Playwright 内置等待
await page.waitForSelector('.result');
await expect(page.locator('.result')).toBeVisible();

// ❌ 避免固定等待
await page.waitForTimeout(3000);
```

### 5. 测试数据管理

```typescript
// ✅ 集中管理
import { TestUsers } from '../../../fixtures/test-data';

// ❌ 硬编码
const username = 'test@example.com';
```

### 6. 错误处理

```typescript
// ✅ 有意义的错误信息
await expect(response, '响应应包含用户名').toContain(username);

// ❌ 无上下文的断言
expect(response).toContain(username);
```

---

## 🐛 故障排除

### 1. 全局设置登录失败

**症状**: 测试启动时认证失败

**解决方案**:
```bash
# 检查账号密码
node -e "require('dotenv').config(); console.log('User:', process.env.TEST_USERNAME)"

# 查看错误截图
# 位置: global-setup-error.png

# 手动测试登录
npm run test:e2e:auth -- --headed
```

### 2. MCP 测试全部跳过

**症状**: `20 skipped`

**原因**: 未配置 `MCP_SERVER_PATH`

**解决方案**:
```bash
# 1. 检查环境变量
node -e "require('dotenv').config(); console.log('MCP_SERVER_PATH:', process.env.MCP_SERVER_PATH)"

# 2. 填写 .env 文件
echo "MCP_SERVER_PATH=C:\your\mcp\server" >> .env

# 3. 重新运行
npm run test:mcp
```

### 3. AI 响应超时

**症状**: `TimeoutError: waiting for response`

**解决方案**:
```bash
# 增加超时时间（.env）
AI_RESPONSE_TIMEOUT=20000

# 检查 AI 服务状态
# 手动访问并测试

# 查看详细日志
npm run test:ai -- --reporter=list
```

### 4. 测试不稳定（偶尔失败）

**症状**: 同一个测试有时通过有时失败

**解决方案**:
```bash
# 1. 增加等待时间
AI_COMMAND_DELAY=2000

# 2. 使用更稳定的选择器
# 优先使用 data-testid

# 3. 禁用并发（排查问题）
npx playwright test --workers=1

# 4. 查看 Trace
npm run test:ui  # 失败后自动打开 trace
```

### 5. 找不到模块错误

**症状**: `Cannot find module '@modelcontextprotocol/sdk'`

**解决方案**:
```bash
# 清理并重装依赖
rm -rf node_modules package-lock.json
npm install

# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 6. Allure 报告生成失败

**症状**: `allure command not found`

**解决方案**:
```bash
# 全局安装 Allure
npm install -g allure-commandline

# 或使用 npx
npx allure serve allure-results

# 验证安装
allure --version
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [tests/README.md](tests/README.md) | 测试架构详细说明 |
| [MCP_QUICKSTART.md](MCP_QUICKSTART.md) | MCP 快速开始指南 |
| [docs/MCP_SETUP_GUIDE.md](docs/MCP_SETUP_GUIDE.md) | MCP 完整配置指南 |
| [.env.example](.env.example) | 环境变量配置示例 |
| [playwright.config.ts](playwright.config.ts) | Playwright 配置文件 |

---

## 📈 测试统计

| 测试层级 | 文件数 | 测试用例 | 执行速度 | 覆盖范围 |
|---------|--------|---------|---------|---------|
| **E2E 测试** | 4 | ~15 | 慢（分钟级） | UI + 后端 + 数据库 |
| **MCP 集成测试** | 3 | 26 | 快（秒级） | MCP 协议 + 工具 + 资源 |
| **合计** | 7 | 41+ | - | - |

---

## 🎯 路线图

### ✅ 已完成
- [x] E2E 测试框架
- [x] AI 对话测试
- [x] MCP 集成测试（26 个用例）
- [x] Allure 报告集成
- [x] 分层测试架构
- [x] CI/CD 集成

### 🚧 进行中
- [ ] API 集成测试
- [ ] 性能测试
- [ ] 安全测试

### 📅 计划中
- [ ] 可视化测试（截图对比）
- [ ] 移动端测试
- [ ] 测试数据工厂
- [ ] Slack/钉钉通知集成

---

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

**贡献规范**:
- 遵循现有代码风格
- 添加适当的测试
- 更新相关文档
- 使用清晰的提交信息

---

## 📄 许可证

MIT License

---

## 📞 联系方式

- **项目维护**: Noosh QA Team
- **问题反馈**: [GitHub Issues](https://github.com/your-org/noosh-ai-tests/issues)
- **文档贡献**: 欢迎提交 PR

---

## ⭐ 快速链接

- 🚀 [快速开始](#快速开始)
- 🎯 [测试分层架构](#测试分层架构)
- 🔧 [MCP 测试配置](#mcp-测试配置)
- 📊 [测试报告](#测试报告)
- 🐛 [故障排除](#故障排除)

---

**Happy Testing! 🚀**

*最后更新: 2025-11-14*
