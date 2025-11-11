# MCP 测试快速开始指南

## 🎯 3 步启用 MCP 测试

### 步骤 1: 创建 .env 文件

在项目根目录创建 `.env` 文件（如果还没有）：

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 步骤 2: 配置 MCP 服务器路径

打开 `.env` 文件，找到并填写 `MCP_SERVER_PATH`：

```bash
# Windows 示例
MCP_SERVER_PATH=C:\Users\YourName\projects\mcp-server

# Linux/Mac 示例
MCP_SERVER_PATH=/home/user/projects/mcp-server
```

**重要**：
- 使用绝对路径
- Windows 路径使用反斜杠 `\`
- Linux/Mac 路径使用正斜杠 `/`

### 步骤 3: 运行 MCP 测试

```bash
npm run test:mcp
```

## ✅ 验证配置

运行以下命令检查配置是否正确：

```bash
# 检查环境变量
node -e "require('dotenv').config(); console.log('MCP_SERVER_PATH:', process.env.MCP_SERVER_PATH)"

# 应该输出类似：
# MCP_SERVER_PATH: C:\Users\YourName\projects\mcp-server
```

## 📋 完整配置项（可选）

如果需要更详细的配置，在 `.env` 文件中添加：

```bash
# 必填
MCP_SERVER_PATH=C:\your\mcp\server\path

# 服务器启动配置（可选，有默认值）
MCP_SERVER_COMMAND=node                          # 默认：node
MCP_SERVER_ARGS=./mcp-server/index.js            # 默认：./mcp-server/index.js

# 测试工具配置（可选）
MCP_TEST_TOOL_NAME=search_knowledge              # 测试用的工具名称
MCP_TEST_TOOL_ARGS={"query":"测试","max_results":5}  # 工具参数（JSON）

# 资源配置（可选）
MCP_TEST_RESOURCE_URI=file:///test/resource.txt  # 测试资源 URI

# 功能开关（可选）
MCP_SUPPORTS_LOGGING=false                       # 是否支持 Logging
MCP_SUPPORTS_SUBSCRIPTIONS=false                 # 是否支持订阅
```

## 🔧 不同类型的 MCP 服务器

### Node.js 服务器（默认）
```bash
MCP_SERVER_PATH=C:\projects\my-mcp-server
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./dist/index.js
```

### Python 服务器
```bash
MCP_SERVER_PATH=/home/user/mcp-server
MCP_SERVER_COMMAND=python3
MCP_SERVER_ARGS=./src/server.py
```

### 自定义可执行文件
```bash
MCP_SERVER_PATH=/opt/mcp-server
MCP_SERVER_COMMAND=./my-server
MCP_SERVER_ARGS=--config,./config.json
```

**注意**：多个参数用逗号分隔，不使用空格。

## 📊 测试覆盖

配置后将运行 **26 个 MCP 测试用例**：

- ✅ **12 个**工具调用测试
- ✅ **6 个**资源访问测试
- ✅ **8 个**协议合规性测试

## ❓ 常见问题

### Q: 所有测试都被跳过？
**A**: 检查 `MCP_SERVER_PATH` 是否已配置且路径正确。

### Q: 连接服务器失败？
**A**:
1. 检查服务器路径是否存在
2. 检查启动命令是否正确
3. 手动启动服务器验证是否能正常运行

### Q: 如何查看详细日志？
**A**:
```bash
npm run test:mcp -- --reporter=list
```

## 📚 更多信息

- 详细配置指南：[docs/MCP_SETUP_GUIDE.md](docs/MCP_SETUP_GUIDE.md)
- 测试架构说明：[tests/README.md](tests/README.md)
- 环境变量示例：[.env.example](.env.example)

## 💡 快速模板

复制以下内容到 `.env` 文件开始使用：

```bash
# 填写您的 MCP 服务器路径即可
MCP_SERVER_PATH=

# 默认配置（通常无需修改）
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=./mcp-server/index.js
```

---

**就这么简单！** 填写 `MCP_SERVER_PATH` 后运行 `npm run test:mcp` 即可开始测试。
