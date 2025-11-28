# Pages (Page Object Model)

此文件夹包含所有页面对象类，遵循 Page Object Model (POM) 设计模式。

## 文件结构

```
pages/
├── README.md              # 本文件
├── index.ts               # 统一导出所有页面对象
├── LoginPage.ts           # 登录页面对象
├── AIAssistantPage.ts     # AI助手页面对象
└── WorkspacePage.ts       # 工作区页面对象
```

## 使用方法

### 导入页面对象

```typescript
// 方式 1: 从 index 统一导入（推荐）
import { LoginPage, AIAssistantPage, WorkspacePage } from '../pages';

// 方式 2: 单独导入
import { LoginPage } from '../pages/LoginPage';
```

### 在测试中使用

页面对象已经通过 fixtures 自动注入，可以直接使用：

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('登录测试', async ({ loginPage, page }) => {
  // loginPage 已经自动初始化
  await loginPage.login('username', 'password');

  // 验证登录成功
  await expect(page).toHaveURL(/.*workspace.*/);
});
```

## 页面对象说明

### LoginPage

登录页面对象，包含登录相关的所有元素和操作。

**主要方法：**
- `login(username, password)` - 执行完整登录流程
- `getErrorMessage()` - 获取错误消息
- `isLoginSuccessful()` - 检查登录是否成功

### AIAssistantPage

AI助手页面对象，用于与AI聊天界面交互。

**主要方法：**
- `openAIAssistant()` - 打开AI助手
- `sendMessage(message)` - 发送消息
- `waitForResponse()` - 等待AI响应
- `getLastMessageText()` - 获取最后一条消息
- `getAllMessages()` - 获取所有消息
- `clearConversation()` - 清空对话

### WorkspacePage

工作区页面对象，用于导航和操作工作区。

**主要方法：**
- `navigateToSection(sectionName)` - 导航到指定区域
- `searchProject(projectName)` - 搜索项目

## 添加新页面对象

1. 在 `pages/` 文件夹创建新的页面类文件（如 `NewPage.ts`）
2. 实现页面类，继承基本的元素定位和操作方法
3. 在 `index.ts` 中导出新页面类
4. 如果需要，在 `fixtures/auth.fixture.ts` 中添加 fixture

示例：

```typescript
// pages/NewPage.ts
import { Page, Locator } from '@playwright/test';

export class NewPage {
  readonly page: Page;
  readonly someElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someElement = page.locator('.some-selector');
  }

  async doSomething() {
    await this.someElement.click();
  }
}
```

## 设计原则

1. **单一职责** - 每个页面对象只负责一个页面或组件
2. **封装** - 隐藏实现细节，只暴露公共接口
3. **可维护性** - 元素选择器集中管理，便于更新
4. **可读性** - 方法名清晰描述操作意图
5. **可测试性** - 方法返回有意义的值，便于断言
