import { Page, Locator } from '@playwright/test';

/**
 * 登录页面对象
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Updated selectors for Noosh login form
    this.usernameInput = page.locator(
      'input[name="j_username"], input#outlined-userid, input[name="username"], input[type="email"]'
    ).first();

    this.passwordInput = page.locator(
      'input[name="j_password"], input#outlined-adornment-password, input[name="password"], input[type="password"]'
    ).first();

    this.submitButton = page.locator(
      'button:has-text("Login"), button[type="submit"], button:has-text("登录")'
    ).first();

    this.errorMessage = page.locator(
      '.error-message, .alert-error, [role="alert"]'
    );
  }

  async goto() {
    await this.page.goto('/workspace/chatbot');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('**/workspace/**', { timeout: 15000 });
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/workspace/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * AI助手页面对象
 */
export class AIAssistantPage {
  readonly page: Page;
  readonly aiAssistantButton: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly lastMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    this.aiAssistantButton = page.locator(
      'text=AI Assistant, button:has-text("AI"), [aria-label*="AI"]'
    ).first();

    this.chatInput = page.locator(
      'textarea[placeholder*="message"], input[placeholder*="message"], textarea[placeholder*="输入"], .chat-input textarea, input[placeholder*="Message"]'
    ).first();

    this.sendButton = page.locator(
      'button[type="submit"], button:has-text("发送"), button:has-text("Send")'
    ).first();

    // Messages could be in various formats - look for text content in the chat area
    this.messages = page.locator('.message, .chat-message, [role="article"], .MuiBox-root p, div p');
    this.lastMessage = this.messages.last();

    this.loadingIndicator = page.locator(
      '.loading, .spinner, .typing-indicator'
    );
  }

  async openAIAssistant() {
    // Check if AI Assistant is already open by looking for the chat input
    const isAlreadyOpen = await this.chatInput.isVisible().catch(() => false);

    if (!isAlreadyOpen) {
      // Try to find and click the AI Assistant button
      const button = this.page.locator('text="AI Assistant"').first();
      await button.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.page.waitForTimeout(500);

    try {
      await this.chatInput.press('Enter');
    } catch {
      await this.sendButton.click();
    }
  }

  async waitForResponse(timeout: number = 30000) {
    console.log('⏳ 等待 AI 响应...');

    try {
      // Step 1: Get initial content to compare
      const chatArea = this.page.locator('main, [role="main"], .chat-area, .conversation-area').first();
      const initialContent = await chatArea.textContent().catch(() => '') || '';
      const initialLength = initialContent.length;
      console.log(`📏 初始内容长度: ${initialLength}`);

      // Step 2: Optional wait for loading indicator (non-blocking)
      // Polling approach to avoid "failed" steps in Allure report
      console.log('🔍 检查加载指示器...');

      const dotsIndicator = this.page.locator('text="..."');
      let loadingDetected = false;
      let loadingType = null;

      // Poll for loading indicator (up to 2 seconds)
      const checkInterval = 200; // Check every 200ms
      const maxChecks = 10; // 2 seconds total

      for (let i = 0; i < maxChecks; i++) {
        const dotsVisible = await dotsIndicator.isVisible().catch(() => false);
        const spinnerVisible = await this.loadingIndicator.isVisible().catch(() => false);

        if (dotsVisible) {
          loadingDetected = true;
          loadingType = 'dots';
          console.log('✓ 检测到点状加载指示器');
          break;
        } else if (spinnerVisible) {
          loadingDetected = true;
          loadingType = 'spinner';
          console.log('✓ 检测到旋转加载指示器');
          break;
        }

        await this.page.waitForTimeout(checkInterval);
      }

      if (loadingDetected) {
        // Wait for loading to disappear
        const indicator = loadingType === 'dots' ? dotsIndicator : this.loadingIndicator;
        await indicator.waitFor({ state: 'hidden', timeout }).catch(() => {
          console.log(`⚠️  ${loadingType === 'dots' ? '点状' : '旋转'}加载指示器未消失`);
        });
      } else {
        console.log('ℹ️  未检测到加载指示器（可能响应很快）');
      }

      // Step 3: Wait for content to change (indicating new response)
      console.log('⏳ 等待内容变化（新响应到达）...');
      const startTime = Date.now();
      const maxWaitTime = 30000; // 30 seconds max
      let contentChanged = false;

      while (Date.now() - startTime < maxWaitTime) {
        await this.page.waitForTimeout(2000); // Check every 2 seconds

        const currentContent = await chatArea.textContent().catch(() => '') || '';
        const currentLength = currentContent.length;

        // Check if content has significantly increased
        if (currentLength > initialLength + 50) {
          console.log(`✓ 检测到内容变化: ${initialLength} → ${currentLength} (+${currentLength - initialLength} 字符)`);
          contentChanged = true;
          break;
        }

        // Also check for response indicators
        const hasResponseIndicators = /Projects Associated|Project ID|Quick Actions|Results|Project Details|Status:/i.test(currentContent);
        if (hasResponseIndicators && currentLength > initialLength) {
          console.log('✓ 检测到响应指示器');
          contentChanged = true;
          break;
        }

        console.log(`⏳ 继续等待... (${currentLength} 字符, ${Math.round((Date.now() - startTime) / 1000)}s)`);
      }

      if (!contentChanged) {
        console.log('⚠️  30秒内未检测到明显的内容变化');
      }

      // Step 4: Additional wait for content to stabilize
      await this.page.waitForTimeout(3000);
      console.log('✓ 响应等待完成');

    } catch (error) {
      console.log(`⚠️  等待响应时出错: ${error}`);
      console.log('使用备用等待策略...');
      await this.page.waitForTimeout(15000);
    }
  }

  async getLastMessageText(): Promise<string> {
    // Try to get text from various message structures
    try {
      // First try to find all text in the chat main area (excluding the input)
      const chatArea = this.page.locator('main, [role="main"], .chat-area, .conversation-area').first();
      const allText = await chatArea.textContent().catch(() => '');

      if (allText && allText.length > 0) {
        // Remove common UI text and static welcome message
        let cleaned = allText
          .replace(/Type your message.../gi, '')
          .replace(/Press Enter to send.*/gi, '')
          .replace(/Welcome to Noosh AI! I'm here to assist you. How can I help you today\?/gi, '')
          .replace(/Just now/g, '|||')  // Use delimiter for "Just now" timestamps
          .trim();

        console.log(`📝 提取的消息文本（前200字符）: ${cleaned.substring(0, 200)}...`);
        return cleaned;
      }
    } catch (error) {
      console.log(`⚠️  获取消息时出错: ${error}`);
    }

    // Fallback to trying specific message locators
    const messageCount = await this.messages.count();
    if (messageCount > 0) {
      const lastMsg = this.messages.nth(messageCount - 1);
      return await lastMsg.textContent() || '';
    }

    return '';
  }

  async getAllMessages(): Promise<string[]> {
    const count = await this.messages.count();
    const messageTexts: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this.messages.nth(i).textContent();
      if (text) messageTexts.push(text.trim());
    }

    return messageTexts;
  }

  async clearConversation() {
    const clearButton = this.page.locator(
      'button:has-text("清空"), button:has-text("Clear")'
    ).first();

    try {
      await clearButton.click();
      await this.page.waitForTimeout(500);
    } catch {
      console.warn('未找到清空按钮');
    }
  }
}

/**
 * 工作区页面对象
 */
export class WorkspacePage {
  readonly page: Page;
  readonly sidebarMenu: Locator;
  readonly projectList: Locator;
  readonly searchInput: Locator;
  readonly userProfile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarMenu = page.locator('.sidebar, .side-nav, [role="navigation"]').first();
    this.projectList = page.locator('.project-list, .projects');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
    this.userProfile = page.locator('.user-profile, .user-menu').first();
  }

  async navigateToSection(sectionName: string) {
    const section = this.page.locator(`text=${sectionName}, [aria-label="${sectionName}"]`).first();
    await section.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchProject(projectName: string) {
    await this.searchInput.fill(projectName);
    await this.page.waitForTimeout(1000);
  }
}
