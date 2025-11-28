import { Page } from '@playwright/test';

/**
 * MCP Helper - Model Context Protocol 集成工具
 * 用于与AI进行智能交互和验证
 */

export class MCPHelper {
  private page: Page;
  private mcpEnabled: boolean;

  constructor(page: Page) {
    this.page = page;
    this.mcpEnabled = process.env.MCP_ENABLED === 'true';
  }

  /**
   * 发送AI命令并等待响应
   * @param command 要发送的命令
   * @param timeout 超时时间（毫秒）
   */
  async sendCommand(command: string, timeout: number = 10000): Promise<void> {
    console.log(`🤖 发送AI命令: "${command}"`);

    // Use user-facing locators (matching AIAssistantPage)
    const chatInput = this.page.getByPlaceholder(/message|输入|Message/i)
      .or(this.page.getByRole('textbox', { name: /message|chat/i }))
      .or(this.page.locator('.chat-input textarea'))
      .first();

    try {
      // Wait for input to be visible
      await chatInput.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`✓ 输入框可见`);

      // CRITICAL: Wait for input to be enabled (not disabled)
      // This handles the case where AI is still processing previous message
      console.log(`⏳ 等待输入框启用...`);
      const startTime = Date.now();
      const enableTimeout = 30000; // 30 seconds

      while (Date.now() - startTime < enableTimeout) {
        const isDisabled = await chatInput.isDisabled().catch(() => true);
        if (!isDisabled) {
          console.log(`✓ 输入框已启用`);
          break;
        }

        // Check every 500ms
        await this.page.waitForTimeout(500);

        // Log progress every 5 seconds
        const elapsed = Date.now() - startTime;
        if (elapsed % 5000 < 500) {
          console.log(`⏳ 仍在等待输入框启用... (${Math.round(elapsed / 1000)}s)`);
        }
      }

      // Final check
      const stillDisabled = await chatInput.isDisabled().catch(() => true);
      if (stillDisabled) {
        throw new Error('输入框在30秒后仍处于禁用状态');
      }

      // Fill the input
      await chatInput.fill(command);
      console.log(`✓ 使用user-facing选择器填充输入框`);

      // 添加延迟以模拟真实用户输入
      const delay = parseInt(process.env.AI_COMMAND_DELAY || '1000');
      await this.page.waitForTimeout(delay);

      // 发送命令（尝试多种方式）
      try {
        await this.page.keyboard.press('Enter');
      } catch (error) {
        // 尝试点击发送按钮 (use user-facing selector)
        const sendButton = this.page.getByRole('button', { name: /send|发送|submit/i })
          .or(this.page.locator('button[type="submit"]'))
          .first();

        await sendButton.click({ timeout: 2000 });
      }

      console.log(`✓ 命令已发送`);
    } catch (error) {
      throw new Error(`无法找到或填充AI输入框: ${error}`);
    }
  }

  /**
   * 等待AI响应
   * @param timeout 超时时间（毫秒）
   */
  async waitForResponse(timeout: number = 10000): Promise<string> {
    console.log(`⏳ 等待AI响应...`);

    // AI响应的可能选择器
    const responseSelectors = [
      '.ai-response:last-child',
      '.message.ai:last-child',
      '.assistant-message:last-child',
      '[data-role="assistant"]:last-child',
      '.chat-message.assistant:last-child',
      '.response-container:last-child'
    ];

    let response = '';
    for (const selector of responseSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: timeout, state: 'visible' });
        response = await this.page.textContent(selector) || '';
        if (response.trim()) {
          console.log(`✓ 收到AI响应: "${response.substring(0, 100)}..."`);
          return response;
        }
      } catch (error) {
        continue;
      }
    }

    // 如果特定选择器失败，尝试获取最后一条消息
    try {
      const lastMessage = await this.page.locator('.message, .chat-message').last().textContent();
      if (lastMessage) {
        console.log(`✓ 收到响应: "${lastMessage.substring(0, 100)}..."`);
        return lastMessage;
      }
    } catch (error) {
      console.warn('⚠️  无法获取AI响应');
    }

    return '';
  }

  /**
   * 验证AI响应内容
   * @param expectedKeywords 期望的关键词列表
   * @param actualResponse 实际响应内容
   */
  validateResponse(expectedKeywords: string[], actualResponse: string): boolean {
    const response = actualResponse.toLowerCase();
    const matched = expectedKeywords.filter(keyword =>
      response.includes(keyword.toLowerCase())
    );

    console.log(`🔍 验证响应关键词: ${matched.length}/${expectedKeywords.length} 匹配`);
    return matched.length > 0;
  }

  /**
   * 等待AI处理完成（无加载动画）
   */
  async waitForProcessing(): Promise<void> {
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-loading="true"]',
      '.processing',
      '.typing-indicator'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout: 30000 });
      } catch (error) {
        // 忽略，可能不存在该加载指示器
      }
    }

    console.log(`✓ AI处理完成`);
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.page.locator('.message, .chat-message').all();
    const history: Array<{ role: string; content: string }> = [];

    for (const message of messages) {
      const role = await message.getAttribute('data-role') || 'unknown';
      const content = await message.textContent() || '';
      history.push({ role, content: content.trim() });
    }

    return history;
  }

  /**
   * 清空对话历史
   */
  async clearConversation(): Promise<void> {
    const clearSelectors = [
      'button:has-text("清空")',
      'button:has-text("Clear")',
      '[aria-label*="清空"]',
      '[aria-label*="Clear"]'
    ];

    for (const selector of clearSelectors) {
      try {
        await this.page.click(selector, { timeout: 2000 });
        console.log(`✓ 对话已清空`);
        return;
      } catch (error) {
        continue;
      }
    }

    console.warn('⚠️  未找到清空按钮');
  }

  /**
   * 截取AI对话区域截图
   */
  async screenshotConversation(path: string): Promise<void> {
    const chatSelectors = [
      '.chat-container',
      '.conversation',
      '.messages-container',
      '#chat-area'
    ];

    for (const selector of chatSelectors) {
      try {
        const element = await this.page.locator(selector).first();
        await element.screenshot({ path });
        console.log(`📸 对话截图已保存: ${path}`);
        return;
      } catch (error) {
        continue;
      }
    }

    // 如果找不到特定容器，截取整个页面
    await this.page.screenshot({ path, fullPage: true });
  }
}

/**
 * AI命令测试数据
 */
export const AICommands = {
  project: {
    copy: 'copy project',
    create: 'create new project',
    list: 'list all projects',
    delete: 'delete project',
    search: 'search project by name',
  },
  task: {
    create: 'create task',
    update: 'update task status',
    assign: 'assign task to user',
    list: 'list all tasks',
    complete: 'mark task as complete',
  },
  general: {
    help: 'help',
    status: 'check status',
    settings: 'open settings',
  },
};
