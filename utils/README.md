# Utils (工具类)

此文件夹包含测试辅助工具类，提供各种通用功能。

## 文件结构

```
utils/
├── README.md                 # 本文件
├── mcp-helper.ts            # MCP (Model Context Protocol) 辅助工具
└── conversation-manager.ts  # AI对话管理器
```

## 工具类说明

### MCPHelper

MCP 协议辅助工具，用于与 MCP 服务器交互和测试。

**主要功能：**
- MCP 工具调用测试
- MCP 资源访问测试
- 提示词(Prompt)测试
- 服务器通知订阅

**使用示例：**

```typescript
import { MCPHelper } from '../utils/mcp-helper';

test('MCP 测试', async ({ page }) => {
  const mcpHelper = new MCPHelper(page);

  // 发送命令到 AI 助手
  await mcpHelper.sendCommand('搜索项目');

  // 等待响应
  await mcpHelper.waitForResponse();
});
```

### ConversationManager

AI 对话管理器，用于追踪和管理多轮对话测试。

**主要功能：**
- 对话历史追踪
- 上下文连续性验证
- 响应质量评估
- 对话统计分析
- 对话历史导出

**使用示例：**

```typescript
import { ConversationManager } from '../utils/conversation-manager';

test('多轮对话测试', async ({ page, mcpHelper, aiAssistantPage }) => {
  const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

  // 发送消息并追踪
  const response1 = await conversation.sendAndTrack('创建项目');
  const response2 = await conversation.sendAndTrack('添加任务');

  // 验证上下文连续性
  const hasContext = await conversation.verifyContextContinuity(
    response2,
    ['项目'],
    { mode: 'any', caseInsensitive: true }
  );

  expect(hasContext).toBeTruthy();

  // 获取统计信息
  const stats = conversation.getStats();
  console.log(`对话轮数: ${stats.totalTurns}`);
  console.log(`平均响应时间: ${stats.avgResponseTime}ms`);

  // 导出对话历史
  await conversation.exportConversation('test-conversation');
});
```

## 对话管理器特性

### 1. 对话追踪

自动记录每轮对话的用户输入、AI响应、时间戳和元数据：

```typescript
await conversation.sendAndTrack('查询项目状态', ['项目', '状态']);
```

### 2. 响应质量验证

```typescript
const quality = conversation.verifyResponseQuality(response, {
  minLength: 50,           // 最小长度
  minWords: 10,            // 最小单词数
  requiredKeywords: ['项目', 'ID'],  // 必需关键词
  forbiddenPhrases: ['错误', 'sorry']  // 禁止短语
});

console.log(`质量检查: ${quality.passed ? '通过' : '失败'}`);
if (!quality.passed) {
  console.log('失败原因:', quality.failures);
}
```

### 3. 上下文提取

从历史对话中提取特定关键词相关的内容：

```typescript
const projectInfo = conversation.extractContextFromHistory(['项目ID', '项目名称']);
```

### 4. 对话导出

导出对话历史和截图用于分析：

```typescript
await conversation.exportConversation('multi-turn-test', true);
// 生成:
// - multi-turn-test.json (对话历史JSON)
// - multi-turn-test.png (页面截图)
```

## 添加新工具类

1. 在 `utils/` 文件夹创建新的工具类文件
2. 实现工具类，遵循单一职责原则
3. 添加必要的类型定义和文档注释
4. 在测试中直接导入使用

示例：

```typescript
// utils/DataGenerator.ts
export class DataGenerator {
  static generateRandomEmail(): string {
    return `test${Date.now()}@example.com`;
  }

  static generateRandomProject(name: string) {
    return {
      name,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
  }
}
```

## 设计原则

1. **工具性** - 提供可复用的辅助功能
2. **无状态/有状态** - 工具类可以是无状态的静态方法集，也可以是有状态的实例类
3. **独立性** - 工具类不应依赖特定的页面对象
4. **文档化** - 提供清晰的使用说明和示例
5. **测试友好** - 工具类本身应该易于测试

## 注意事项

⚠️ **重要提示：**
- `utils/` 文件夹只包含工具类，不包含页面对象
- 页面对象现在位于 `pages/` 文件夹
- 如果需要使用页面对象，请从 `pages/` 导入

```typescript
// ✅ 正确
import { LoginPage } from '../pages';
import { MCPHelper } from '../utils/mcp-helper';

// ❌ 错误（page-objects.ts 已移除）
import { LoginPage } from '../utils/page-objects';
```
