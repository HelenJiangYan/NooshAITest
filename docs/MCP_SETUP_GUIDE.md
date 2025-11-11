# MCP 集成测试配置指南

本指南将帮助您配置 MCP (Model Context Protocol) 集成测试环境。

---

## 📋 前提条件

1. ✅ 已安装 Node.js (v18+)
2. ✅ 已安装项目依赖 (`npm install`)
3. ✅ 拥有一个可用的 MCP 服务器

---

## 🚀 快速开始

### 步骤 1: 创建 .env 配置文件

复制示例配置文件并编辑：

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 步骤 2: 配置 MCP 服务器路径

打开 `.env` 文件，找到 `MCP_SERVER_PATH` 并填写您的 MCP 服务器路径：

**Windows 示例**：
```bash
MCP_SERVER_PATH=C:\Users\YourName\projects\mcp-server
```

**Linux/Mac 示例**：
```bash
MCP_SERVER_PATH=/home/user/projects/mcp-server
```

### 步骤 3: 配置启动命令和参数

根据您的 MCP 服务器类型，配置启动命令：

#### Node.js 服务器（默认）
```bash
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./mcp-server/index.js
```

#### Python 服务器
```bash
MCP_SERVER_COMMAND=python
MCP_SERVER_ARGS=./mcp-server/main.py
```

#### 自定义可执行文件
```bash
MCP_SERVER_COMMAND=./my-mcp-server
MCP_SERVER_ARGS=--config,./config.json
```

**注意**：多个参数用逗号分隔，不要使用空格。

### 步骤 4: 运行 MCP 测试

```bash
# 运行所有 MCP 测试
npm run test:mcp

# 查看详细输出
npm run test:mcp -- --reporter=list

# 调试模式
npm run test:mcp -- --debug
```

---

## 🔧 高级配置

### 1. 配置测试工具

如果您的 MCP 服务器提供特定工具，可以配置测试用的工具名称和参数：

```bash
# 工具名称
MCP_TEST_TOOL_NAME=search_knowledge

# 工具参数（JSON 格式）
MCP_TEST_TOOL_ARGS={"query":"测试查询","max_results":5}
```

### 2. 配置测试资源

如果您的 MCP 服务器提供资源访问功能：

```bash
# 普通资源 URI
MCP_TEST_RESOURCE_URI=file:///test/resource.txt

# 受限资源 URI（用于权限测试）
MCP_TEST_RESTRICTED_RESOURCE=file:///restricted/resource.txt

# 资源模板 URI
MCP_TEST_RESOURCE_TEMPLATE=file:///{workspace}/README.md
```

### 3. 启用可选功能

根据您的 MCP 服务器支持的功能，启用相应的测试：

```bash
# 启用 Logging 功能测试
MCP_SUPPORTS_LOGGING=true

# 启用资源订阅功能测试
MCP_SUPPORTS_SUBSCRIPTIONS=true
```

---

## 📊 测试覆盖范围

配置完成后，将运行以下 **26 个测试用例**：

### 工具调用测试（12 个）
- ✅ MCP 服务器连接
- ✅ 列出可用工具
- ✅ 调用工具并验证返回值
- ✅ 工具参数验证
- ✅ 不存在工具的错误处理
- ✅ 工具调用性能测试

### 资源访问测试（6 个）
- ✅ 列出可用资源
- ✅ 读取资源内容
- ✅ 不存在资源的错误处理
- ✅ 资源模板和变量替换
- ✅ 资源订阅通知
- ✅ 资源权限控制

### 协议合规性测试（8 个）
- ✅ 协议初始化握手
- ✅ 客户端能力声明
- ✅ JSON-RPC 2.0 错误格式
- ✅ 服务器超时处理
- ✅ Prompts 功能支持
- ✅ Logging 功能支持
- ✅ 协议版本兼容性
- ✅ 并发请求支持

---

## 🎯 实际配置示例

### 示例 1: 本地 Node.js MCP 服务器

```bash
# .env 文件配置
MCP_SERVER_PATH=C:\projects\my-mcp-server
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./dist/index.js

# 测试工具配置
MCP_TEST_TOOL_NAME=calculate
MCP_TEST_TOOL_ARGS={"expression":"2+2"}

# 功能开关
MCP_SUPPORTS_LOGGING=true
MCP_SUPPORTS_SUBSCRIPTIONS=false
```

### 示例 2: Python MCP 服务器

```bash
# .env 文件配置
MCP_SERVER_PATH=/home/user/mcp-server
MCP_SERVER_COMMAND=python3
MCP_SERVER_ARGS=./src/server.py,--port,8080

# 测试工具配置
MCP_TEST_TOOL_NAME=search
MCP_TEST_TOOL_ARGS={"q":"test","limit":10}

# 资源配置
MCP_TEST_RESOURCE_URI=resource://docs/readme
MCP_SUPPORTS_LOGGING=true
MCP_SUPPORTS_SUBSCRIPTIONS=true
```

### 示例 3: Docker 容器中的 MCP 服务器

```bash
# .env 文件配置
MCP_SERVER_COMMAND=docker
MCP_SERVER_ARGS=run,--rm,my-mcp-server:latest

# 注意：不需要配置 MCP_SERVER_PATH
# 因为启动命令是 docker 而不是本地路径
```

---

## ❓ 常见问题

### Q1: 测试全部被跳过？

**原因**：未配置 `MCP_SERVER_PATH` 环境变量。

**解决方法**：
1. 检查 `.env` 文件是否存在
2. 确认 `MCP_SERVER_PATH` 已填写
3. 确认路径格式正确（Windows 用 `\`，Linux/Mac 用 `/`）

### Q2: 连接 MCP 服务器失败？

**可能原因**：
- ❌ MCP 服务器路径错误
- ❌ 启动命令或参数错误
- ❌ MCP 服务器未启动或崩溃

**调试步骤**：
```bash
# 1. 检查服务器路径是否存在
ls "$MCP_SERVER_PATH"  # Linux/Mac
dir "%MCP_SERVER_PATH%"  # Windows

# 2. 手动启动服务器验证
cd /path/to/mcp-server
node ./mcp-server/index.js  # 替换为您的启动命令

# 3. 查看详细测试日志
npm run test:mcp -- --reporter=list --workers=1
```

### Q3: 部分测试失败？

**常见原因**：
1. **工具名称错误**：检查 `MCP_TEST_TOOL_NAME` 是否与服务器提供的工具名称一致
2. **参数格式错误**：确保 `MCP_TEST_TOOL_ARGS` 是有效的 JSON
3. **资源 URI 错误**：检查资源路径是否存在

**解决方法**：
```bash
# 查看 Allure 报告获取详细错误信息
npm run test:mcp
npm run allure:serve

# 或查看测试失败截图和视频
# 位置：test-results/
```

### Q4: 如何跳过特定测试？

如果某些功能暂时不可用，可以通过环境变量控制：

```bash
# 跳过 Logging 功能测试
MCP_SUPPORTS_LOGGING=false

# 跳过订阅功能测试
MCP_SUPPORTS_SUBSCRIPTIONS=false

# 跳过资源模板测试（不配置 MCP_TEST_RESOURCE_TEMPLATE）
# MCP_TEST_RESOURCE_TEMPLATE=
```

### Q5: 如何只运行特定测试？

```bash
# 只运行工具调用测试
npx playwright test tests/integration/mcp/tool-invocation.spec.ts

# 只运行资源访问测试
npx playwright test tests/integration/mcp/resource-access.spec.ts

# 只运行协议合规性测试
npx playwright test tests/integration/mcp/protocol-compliance.spec.ts

# 使用标签过滤
npx playwright test --grep @performance  # 只运行性能测试
npx playwright test --grep @security     # 只运行安全测试
```

---

## 🔍 验证配置

运行以下命令验证配置是否正确：

```bash
# 1. 检查环境变量是否加载
node -e "require('dotenv').config(); console.log('MCP_SERVER_PATH:', process.env.MCP_SERVER_PATH)"

# 2. 运行单个测试验证连接
npx playwright test tests/integration/mcp/tool-invocation.spec.ts -g "应成功连接到 MCP 服务器"

# 3. 查看详细日志
npm run test:mcp -- --reporter=list --workers=1 --max-failures=1
```

---

## 📚 相关文档

- [MCP 协议规范](https://spec.modelcontextprotocol.io/)
- [测试架构说明](../tests/README.md)
- [Playwright 配置](../playwright.config.ts)
- [环境变量示例](../.env.example)

---

## 💡 提示

1. **安全性**：不要将 `.env` 文件提交到 Git 仓库（已在 `.gitignore` 中）
2. **团队协作**：更新 `.env.example` 文件并提交，让团队成员了解新的配置项
3. **CI/CD**：在 CI 环境中使用环境变量或密钥管理工具配置 MCP 路径
4. **调试**：使用 `--debug` 模式可以逐步执行测试并查看详细信息

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 [tests/README.md](../tests/README.md) 了解测试架构
2. 检查 [Allure 报告](../allure-report/index.html) 获取详细错误信息
3. 查看测试失败的截图和视频：`test-results/`
4. 联系 QA 团队获取支持
