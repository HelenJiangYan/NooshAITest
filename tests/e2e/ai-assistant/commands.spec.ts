import { test, expect } from '../../../fixtures/auth.fixture';
import { AITestCommands, Timeouts } from '../../../fixtures/test-data';
import { ConversationManager } from '../../../utils/conversation-manager';

/**
 * AI助手命令测试套件
 * 测试AI助手的各种命令响应
 */
test.describe('AI助手命令测试', () => {
  // 使用已认证的 context
  test.use({ storageState: 'auth-state.json' });

  test.beforeEach(async ({ page, aiAssistantPage }) => {
    // 使用已认证的状态访问工作区
    await page.goto('/workspace/chatbot');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // Brief wait for dynamic content

    // 打开AI助手
    await aiAssistantPage.openAIAssistant();
  });

  test('AI助手界面加载验证 @smoke', async ({ aiAssistantPage }) => {
    await expect(aiAssistantPage.chatInput).toBeVisible();
    await expect(aiAssistantPage.chatInput).toBeEditable();
  });

  test('发送"copy project"命令 @smoke', async ({ aiAssistantPage, mcpHelper, page }) => {
    // 发送命令
    await mcpHelper.sendCommand('copy project');

    // 等待AI响应
    await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

    // 获取响应内容
    const response = await aiAssistantPage.getLastMessageText();
    console.log(`AI响应: ${response}`);

    // 验证响应不为空
    expect(response).not.toBe('');
    expect(response.length).toBeGreaterThan(0);

    // 截图保存结果
    await page.screenshot({
      path: 'test-results/screenshots/copy-project-command.png',
      fullPage: true,
    });
  });

  test.describe('项目管理命令', () => {
    for (const cmd of AITestCommands.projectCommands) {
      test(`测试命令: ${cmd.description} (@${cmd.priority})`, async ({ aiAssistantPage, mcpHelper, page }) => {
        await mcpHelper.sendCommand(cmd.command);
        await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

        const response = await aiAssistantPage.getLastMessageText();
        console.log(`命令: ${cmd.command}`);
        console.log(`响应: ${response.substring(0, 200)}...`);

        expect(response).not.toBe('');

        await page.screenshot({
          path: `test-results/screenshots/cmd-${cmd.category}-${Date.now()}.png`,
          fullPage: true,
        });
      });
    }
  });

  test.describe('任务管理命令', () => {
    for (const cmd of AITestCommands.taskCommands) {
      test(`测试命令: ${cmd.description} (@${cmd.priority})`, async ({ aiAssistantPage, mcpHelper }) => {
        await mcpHelper.sendCommand(cmd.command);
        await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

        const response = await aiAssistantPage.getLastMessageText();
        console.log(`命令: ${cmd.command} -> 响应长度: ${response.length}字符`);

        expect(response).not.toBe('');
      });
    }
  });

  test.describe('通用命令', () => {
    for (const cmd of AITestCommands.generalCommands) {
      test(`测试命令: ${cmd.description} (@${cmd.priority})`, async ({ aiAssistantPage, mcpHelper }) => {
        await mcpHelper.sendCommand(cmd.command);
        await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

        const response = await aiAssistantPage.getLastMessageText();
        expect(response).not.toBe('');
      });
    }
  });

  test('AI响应速度测试 @performance', async ({ aiAssistantPage, mcpHelper }) => {
    const startTime = Date.now();

    await mcpHelper.sendCommand('help');
    await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`AI响应时间: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(12000);
  });

  test('多轮对话测试（增强版）', async ({ page, aiAssistantPage, mcpHelper }) => {
    const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

    // 第一轮对话
    const response1 = await conversation.sendAndTrack('list all projects', ['project']);
    expect(response1).not.toBe('');
    expect(response1.toLowerCase()).toContain('project');

    await conversation.wait(1500);

    // 第二轮对话
    const response2 = await conversation.sendAndTrack('create new project', ['project', 'create']);
    expect(response2).not.toBe('');

    // 验证两次响应不同
    expect(response1).not.toBe(response2);

    await conversation.wait(1500);

    // 第三轮：验证上下文连续性
    const response3 = await conversation.sendAndTrack('what is the status of the first one?');
    const hasContext = await conversation.verifyContextContinuity(
      response3,
      ['project'],
      { mode: 'any' }
    );
    expect(hasContext).toBeTruthy();

    // 验证响应质量
    const qualityCheck = conversation.verifyResponseQuality(response3, {
      minLength: 10,
      requiredKeywords: ['status']
    });
    expect(qualityCheck.passed).toBeTruthy();

    // 获取完整对话历史
    const history = conversation.getHistory();
    console.log(`对话轮次: ${history.length}`);
    expect(history.length).toBe(3);

    // 导出对话记录
    await conversation.exportConversation('multi-turn-enhanced');

    // 输出统计信息
    const stats = conversation.getStats();
    console.log(`统计: ${JSON.stringify(stats, null, 2)}`);
  });
});

/**
 * 错误处理测试
 */
test.describe('AI助手错误处理', () => {
  // 使用已认证的 context
  test.use({ storageState: 'auth-state.json' });

  test.beforeEach(async ({ page, aiAssistantPage }) => {
    await page.goto('/workspace/chatbot');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // Brief wait for dynamic content
    await aiAssistantPage.openAIAssistant();
  });

  test('无效命令处理', async ({ aiAssistantPage, mcpHelper }) => {
    await mcpHelper.sendCommand('invalid command xyz123');
    await aiAssistantPage.waitForResponse();

    const response = await aiAssistantPage.getLastMessageText();
    expect(response).not.toBe('');
  });

  test('特殊字符输入', async ({ aiAssistantPage, mcpHelper }) => {
    const specialChars = '<script>alert("test")</script>';

    await mcpHelper.sendCommand(specialChars);
    await aiAssistantPage.waitForResponse();

    const response = await aiAssistantPage.getLastMessageText();
    expect(response).not.toBe('');
  });
});
