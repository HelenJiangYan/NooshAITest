# Noosh AI 测试架构说明

## 测试分层策略

本项目采用**分层测试策略**（Test Pyramid），将测试按照范围、速度和维护成本分为多个层级：

```
        /\
       /  \  E2E Tests (UI 层)
      /----\
     / MCP  \  Integration Tests (集成层)
    / + API  \
   /----------\
```

### 层级说明

#### 1. E2E 测试层 (`tests/e2e/`)
**测试范围**：完整用户流程（UI + 后端 + 数据库）
**工具**：Playwright
**执行速度**：慢（需要启动浏览器）
**测试数量**：少（10-20 个关键流程）

**子目录**：
- `e2e/auth/` - 认证相关的端到端测试
- `e2e/ai-assistant/` - AI 助手功能的端到端测试
- `e2e/workflows/` - 完整工作流程测试

**运行命令**：
```bash
npm run test:e2e              # 运行所有 E2E 测试
npm run test:e2e:auth         # 仅运行认证测试
npm run test:e2e:ai           # 仅运行 AI 助手测试
npm run test:e2e:workflows    # 仅运行工作流测试
```

---

#### 2. 集成测试层 (`tests/integration/`)
**测试范围**：模块间交互（MCP 协议、API 端点）
**工具**：Playwright Test + @modelcontextprotocol/sdk
**执行速度**：中速（无需浏览器）
**测试数量**：中等（30-50 个场景）

**子目录**：

##### `integration/mcp/` - MCP 协议集成测试（重点）
测试 MCP (Model Context Protocol) 客户端与服务器之间的通信：

- **`tool-invocation.spec.ts`** - MCP 工具调用测试
  - 连接到 MCP 服务器
  - 列出可用工具
  - 调用工具并验证返回值格式
  - 参数验证和错误处理
  - 性能测试

- **`resource-access.spec.ts`** - MCP 资源访问测试
  - 列出可用资源
  - 读取资源内容
  - 资源模板和变量替换
  - 资源订阅和更新通知
  - 权限控制测试

- **`protocol-compliance.spec.ts`** - MCP 协议合规性测试
  - JSON-RPC 2.0 消息格式验证
  - 协议初始化握手
  - 能力声明和协商
  - 错误响应格式验证
  - 版本兼容性测试
  - 并发请求支持

##### `integration/api/` - API 集成测试（预留）
此目录预留用于未来的 API 集成测试：
- REST API 端点测试
- GraphQL 查询测试
- WebSocket 连接测试
- API 认证和授权测试

**运行命令**：
```bash
npm run test:integration      # 运行所有集成测试
npm run test:mcp              # 仅运行 MCP 协议测试
npm run test:api              # 仅运行 API 测试（未来）
```

---

## MCP 测试配置

MCP 集成测试需要配置环境变量来连接真实的 MCP 服务器。

### 环境变量

在项目根目录创建 `.env` 文件：

```bash
# MCP 服务器配置
MCP_SERVER_PATH=/path/to/your/mcp-server       # MCP 服务器路径
MCP_SERVER_COMMAND=node                         # 启动命令
MCP_SERVER_ARGS=./mcp-server/index.js          # 命令参数

# 测试工具配置（可选）
MCP_TEST_TOOL_NAME=search_knowledge             # 测试用的工具名称
MCP_TEST_TOOL_ARGS={"query":"测试","max_results":5}  # 工具参数

# 测试资源配置（可选）
MCP_TEST_RESOURCE_URI=file:///test/resource.txt # 测试资源 URI
MCP_TEST_RESTRICTED_RESOURCE=file:///restricted # 受限资源 URI（用于权限测试）

# 功能开关
MCP_SUPPORTS_LOGGING=true                       # 服务器是否支持日志
MCP_SUPPORTS_SUBSCRIPTIONS=true                 # 服务器是否支持订阅
```

### 跳过测试

如果没有配置 `MCP_SERVER_PATH`，MCP 测试会自动跳过（`test.skip()`），不会导致测试失败。

---

## 测试执行策略

### 开发阶段
```bash
# 快速验证（仅运行集成测试）
npm run test:integration

# 验证 MCP 协议实现
npm run test:mcp
```

### 提交前验证
```bash
# 运行所有测试
npm test

# 或分层运行
npm run test:integration && npm run test:e2e
```

### CI/CD 流水线
```bash
# 阶段 1: 集成测试（快速反馈）
npm run test:integration

# 阶段 2: E2E 测试（全面验证）
npm run test:e2e

# 生成 Allure 报告
npm run test:allure
```

---

## 测试标签（Tags）

测试使用标签进行分类，方便选择性执行：

| 标签 | 说明 | 示例 |
|------|------|------|
| `@smoke` | 冒烟测试（关键功能） | `playwright test --grep @smoke` |
| `@regression` | 回归测试（完整验证） | `playwright test --grep @regression` |
| `@integration` | 集成测试 | `playwright test --grep @integration` |
| `@mcp` | MCP 协议测试 | `playwright test --grep @mcp` |
| `@performance` | 性能测试 | `playwright test --grep @performance` |
| `@security` | 安全性测试 | `playwright test --grep @security` |
| `@protocol` | 协议合规性测试 | `playwright test --grep @protocol` |
| `@compatibility` | 兼容性测试 | `playwright test --grep @compatibility` |
| `@concurrency` | 并发测试 | `playwright test --grep @concurrency` |

**组合使用示例**：
```bash
# 只运行 MCP 工具调用测试
playwright test --grep "@mcp.*tool"

# 排除性能测试
playwright test --grep-invert @performance

# 只运行集成层的冒烟测试
playwright test tests/integration --grep @smoke
```

---

## 目录结构总览

```
tests/
├── README.md                           # 本文档
│
├── e2e/                                # E2E 端到端测试
│   ├── auth/                           # 认证测试
│   │   └── login.spec.ts               # 登录功能测试
│   ├── ai-assistant/                   # AI 助手测试
│   │   ├── commands.spec.ts            # 命令响应测试
│   │   └── multi-turn-conversations.spec.ts  # 多轮对话测试
│   └── workflows/                      # 工作流测试
│       └── user-workflows.spec.ts      # 用户工作流测试
│
└── integration/                        # 集成测试
    ├── mcp/                            # MCP 协议测试
    │   ├── tool-invocation.spec.ts     # 工具调用测试
    │   ├── resource-access.spec.ts     # 资源访问测试
    │   └── protocol-compliance.spec.ts # 协议合规性测试
    │
    └── api/                            # API 集成测试（预留）
        └── .gitkeep                    # 占位文件
```

---

## 测试报告

### Allure Report

项目配置了 Allure Report 作为主要测试报告工具：

```bash
# 运行测试并生成报告
npm run test:allure

# 仅生成报告（基于已有的 allure-results）
npm run allure:generate

# 查看报告
npm run allure:open

# 启动报告服务器
npm run allure:serve

# 清理报告
npm run allure:clean
```

### 其他报告格式

测试同时生成多种格式的报告：
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`
- **Allure Report**: `allure-report/index.html`

---

## 最佳实践

### 1. MCP 测试 vs E2E 测试

**何时使用 MCP 测试**：
- 验证工具调用参数和返回值格式
- 测试 MCP 协议实现是否符合规范
- 快速验证 MCP 服务器功能
- 定位协议层问题

**何时使用 E2E 测试**：
- 验证用户可见的 AI 回复内容
- 测试完整的用户交互流程
- 验证 UI 界面正确性

### 2. 测试数据管理

- 测试数据存放在 `fixtures/` 目录
- 敏感信息使用环境变量（`.env` 文件）
- 不要在测试代码中硬编码密码或 API 密钥

### 3. 测试隔离

- 每个测试应该独立运行
- 使用 `beforeEach` 和 `afterEach` 清理状态
- MCP 客户端在每个测试结束后关闭连接

### 4. 错误处理

- 集成测试应该验证错误场景
- 使用 `try-catch` 验证异常抛出
- 验证错误消息符合协议规范

---

## 常见问题

### Q: MCP 测试全部被跳过？
A: 请检查 `.env` 文件中的 `MCP_SERVER_PATH` 是否配置。如果未配置，测试会自动跳过。

### Q: 如何调试 MCP 测试？
A: 使用 `--debug` 模式：
```bash
npm run test:mcp -- --debug
```

### Q: 测试失败时如何查看详细日志？
A: 查看 Allure 报告或使用 `--reporter=list` 查看控制台输出：
```bash
npm run test:mcp -- --reporter=list
```

### Q: 如何只运行一个测试文件？
A: 指定文件路径：
```bash
playwright test tests/integration/mcp/tool-invocation.spec.ts
```

---

## 贡献指南

添加新测试时请遵循以下规范：

1. **选择合适的层级**：
   - UI 交互测试 → `tests/e2e/`
   - MCP 协议测试 → `tests/integration/mcp/`
   - API 端点测试 → `tests/integration/api/`

2. **使用描述性的测试名称**：
   ```typescript
   test('应正确处理工具参数验证错误', async () => { ... })
   ```

3. **添加适当的标签**：
   ```typescript
   test.describe('MCP 工具调用测试 @integration @mcp', () => { ... })
   ```

4. **编写清晰的错误信息**：
   ```typescript
   expect(result.content).toBeDefined();  // ❌ 不够清晰
   expect(result.content, '工具返回值应包含 content 字段').toBeDefined();  // ✅ 清晰
   ```

5. **保持测试独立**：每个测试应该能够单独运行成功

---

## 参考资源

- [Playwright 官方文档](https://playwright.dev)
- [MCP 协议规范](https://spec.modelcontextprotocol.io/)
- [Allure Report 文档](https://docs.qameta.io/allure/)
- [测试金字塔理论](https://martinfowler.com/bliki/TestPyramid.html)
