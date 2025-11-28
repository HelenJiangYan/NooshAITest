import { test, expect } from '../../../fixtures/auth.fixture';
import { TestUsers, Timeouts } from '../../../fixtures/test-data';

/**
 * 端到端集成测试
 * 模拟真实用户完整工作流程
 */
test.describe('端到端集成测试', () => {
  // 第一个测试手动登录，其他测试使用认证状态

  test('完整用户工作流: 登录 -> 打开AI助手 -> 执行copy project命令 @smoke @regression', async ({
    page,
    loginPage,
    aiAssistantPage,
    mcpHelper,
  }) => {
    test.setTimeout(60000);

    // Step 1: 登录
    console.log('Step 1: 开始登录流程...');
    await page.goto('/workspace/chatbot');
    await loginPage.login(TestUsers.standard.username, TestUsers.standard.password);

    await expect(page).toHaveURL(/.*workspace.*/);
    console.log('✓ 登录成功');

    // Step 2: 等待页面完全加载
    console.log('Step 2: 等待页面加载...');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Step 3: 打开AI助手
    console.log('Step 3: 打开AI助手...');
    await aiAssistantPage.openAIAssistant();
    await expect(aiAssistantPage.chatInput).toBeVisible({ timeout: Timeouts.medium });
    console.log('✓ AI助手已打开');

    // Step 4: 发送"copy project"命令
    console.log('Step 4: 发送命令: copy project');
    await mcpHelper.sendCommand('copy project');

    // Step 5: 等待AI响应
    console.log('Step 5: 等待AI响应...');
    await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

    // Step 6: 验证响应
    console.log('Step 6: 验证响应...');
    const response = await aiAssistantPage.getLastMessageText();
    expect(response).not.toBe('');
    expect(response.length).toBeGreaterThan(0);

    console.log(`✓ 收到AI响应: ${response.substring(0, 100)}...`);

    // Step 7: 截图记录最终状态
    await page.screenshot({
      path: 'test-results/screenshots/e2e-final-state.png',
      fullPage: true,
    });

    console.log('✓ 端到端测试完成');
  });
});

/**
 * 已认证用户的工作流测试
 * 使用全局设置保存的认证状态
 */
test.describe('已认证用户工作流', () => {
  // 使用已保存的认证状态
  test.use({ storageState: 'auth-state.json' });

  test('多命令工作流测试', async ({ page, aiAssistantPage, mcpHelper }) => {
    test.setTimeout(90000);

    await page.goto('/workspace/chatbot');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    await aiAssistantPage.openAIAssistant();

    const commandSequence = [
      { cmd: 'help', desc: '获取帮助' },
      { cmd: 'list all projects', desc: '列出项目' },
      { cmd: 'copy project', desc: '复制项目' },
      { cmd: 'check status', desc: '检查状态' },
    ];

    for (const { cmd, desc } of commandSequence) {
      console.log(`执行: ${desc} (${cmd})`);

      await mcpHelper.sendCommand(cmd);
      await aiAssistantPage.waitForResponse(Timeouts.aiResponse);

      const response = await aiAssistantPage.getLastMessageText();
      expect(response).not.toBe('');

      console.log(`✓ ${desc} 完成`);
      await page.waitForTimeout(1000);
    }

    const allMessages = await aiAssistantPage.getAllMessages();
    console.log(`总对话轮次: ${allMessages.length}`);
    expect(allMessages.length).toBeGreaterThanOrEqual(commandSequence.length);
  });

  test('错误恢复流程', async ({ page, aiAssistantPage, mcpHelper }) => {
    test.setTimeout(60000);

    await page.goto('/workspace/chatbot');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    await aiAssistantPage.openAIAssistant();

    // 1. 发送无效命令
    console.log('发送无效命令...');
    await mcpHelper.sendCommand('invalid command xyz');
    await aiAssistantPage.waitForResponse();

    let response = await aiAssistantPage.getLastMessageText();
    expect(response).not.toBe('');
    console.log('✓ 系统返回错误提示');

    // 2. 恢复：发送有效命令
    console.log('发送有效命令...');
    await mcpHelper.sendCommand('help');
    await aiAssistantPage.waitForResponse();

    response = await aiAssistantPage.getLastMessageText();
    expect(response).not.toBe('');
    console.log('✓ 系统正常响应');
  });
});
