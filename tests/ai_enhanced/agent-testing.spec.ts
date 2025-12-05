import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AIAssistantPage } from '../../pages/AIAssistantPage';
import { getEvaluator, LLMEvaluator } from '../../utils/llm-evaluator';

/**
 * AI 智能体测试 - 多轮对话场景
 *
 * 使用 LLM 评判 LLM 的方式验证 AI 助手的行为：
 * - 上下文连续性：AI 是否能记住之前的对话内容
 * - 逻辑一致性：AI 前后回答是否一致
 * - 上下文切换：AI 是否能处理话题转换
 * - 错误恢复：AI 在遇到异常输入后能否恢复
 * - 复杂流程：AI 处理多步骤任务的能力
 */

interface MultiTurnScenario {
  name: string;
  description: string;
  commands: string[];
  expectedBehavior: string;
}

test.describe('AI 智能体多轮对话测试 @ai_enhanced', () => {
  // 多轮对话测试需要更长的超时时间
  test.setTimeout(180000); // 3分钟

  let loginPage: LoginPage;
  let aiAssistantPage: AIAssistantPage;
  let evaluator: LLMEvaluator;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    aiAssistantPage = new AIAssistantPage(page);
    evaluator = getEvaluator();

    const username = process.env.TEST_USERNAME || 'dgo1g1mgr1';
    const password = process.env.TEST_PASSWORD || 'noosh123';
    await loginPage.login(username, password);
    await aiAssistantPage.openAIAssistant();
  });

  /**
   * 执行多轮对话测试的通用方法
   */
  async function executeMultiTurnTest(scenario: MultiTurnScenario) {
    console.log(`\n🧪 测试场景: ${scenario.name}`);
    console.log(`📄 描述: ${scenario.description}`);
    console.log(`📝 对话轮次: ${scenario.commands.length}`);

    const conversationHistory: Array<{ role: string; content: string }> = [];

    for (let i = 0; i < scenario.commands.length; i++) {
      const command = scenario.commands[i];
      console.log(`\n📤 [${i + 1}/${scenario.commands.length}] 用户: "${command}"`);

      await aiAssistantPage.sendMessage(command);
      await aiAssistantPage.waitForResponse();
      const response = await aiAssistantPage.getLastMessageText();

      // 清理响应中的UI元素文本
      const cleanedResponse = cleanResponse(response);
      console.log(`📥 AI: "${cleanedResponse.substring(0, 150)}${cleanedResponse.length > 150 ? '...' : ''}"`);

      conversationHistory.push({ role: 'user', content: command });
      conversationHistory.push({ role: 'assistant', content: cleanedResponse });

      // 轮次间等待，避免请求过快
      if (i < scenario.commands.length - 1) {
        await aiAssistantPage.page.waitForTimeout(1500);
      }
    }

    // 构建完整对话上下文供评估使用
    const fullContext = conversationHistory
      .map((msg) => `[${msg.role === 'user' ? '用户' : 'AI'}]: ${msg.content.substring(0, 300)}`)
      .join('\n');

    // 使用 LLM 评估整体对话质量
    const result = await evaluator.evaluate({
      userInput: scenario.commands.join(' → '),
      aiResponse: conversationHistory
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content)
        .join('\n---\n'),
      expectedBehavior: scenario.expectedBehavior,
      context: `场景描述: ${scenario.description}\n\n完整对话历史:\n${fullContext}`
    });

    console.log(`\n📊 LLM 评估结果:`);
    console.log(`   状态: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   分数: ${result.score}/100`);
    console.log(`   分类: ${result.category}`);
    console.log(`   理由: ${result.reasoning}`);

    return result;
  }

  /**
   * 清理响应文本，移除UI元素
   */
  function cleanResponse(response: string): string {
    // 移除常见的UI元素文本
    return response
      .replace(/\|\|\|/g, '')
      .replace(/Thinking[\d:]+/g, '')
      .replace(/Processing your message\.\.\./g, '')
      .replace(/Analyzing user request/g, '')
      .replace(/COMPLETED[\d:]+/g, '')
      .replace(/Quick Actions[\d:]+/g, '')
      .replace(/\d+ tools? executed, \d+ thoughts?/g, '')
      .replace(/\d+ events?/g, '')
      .trim();
  }

  test.describe('上下文连续性测试', () => {

    test('代词引用测试 - AI应理解代词引用之前的内容', async () => {
      const result = await executeMultiTurnTest({
        name: '代词引用测试',
        description: '测试AI是否能理解代词引用之前提到的内容',
        commands: [
          'list all my projects',
          'copy the first one',
          'what is its status?'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 第一轮：列出用户的项目
2. 第二轮：理解"the first one"指的是第一个项目，并执行复制操作
3. 第三轮：理解"its"指的是刚才复制的项目，并告知状态
AI 必须在整个对话中保持上下文连贯，正确解析代词引用。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('跨多轮状态记忆 - AI应记住3轮以上的对话上下文', async () => {
      const result = await executeMultiTurnTest({
        name: '跨多轮状态记忆',
        description: '测试AI是否能记住3轮以上的对话上下文',
        commands: [
          'create a new project called Marketing Campaign 2024',
          'add a task named Design Review',
          'set the priority to high',
          'assign it to John',
          'when is the deadline for this task?'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 创建名为"Marketing Campaign 2024"的项目
2. 在该项目中添加名为"Design Review"的任务
3. 将该任务优先级设为高
4. 将任务分配给John
5. 回答关于该任务截止日期的问题
关键验证点：AI 必须在第5轮对话中仍然记住前面建立的上下文（项目名、任务名、分配对象等），不应该询问"哪个任务"。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });
  });

  test.describe('逻辑一致性测试', () => {

    test('信息不矛盾测试 - AI前后回答应一致', async () => {
      const result = await executeMultiTurnTest({
        name: '信息不矛盾测试',
        description: '测试AI前后回答的一致性',
        commands: [
          'create a project named Alpha',
          'what projects do I have?',
          'tell me about project Alpha'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 创建名为"Alpha"的项目并确认
2. 列出项目时应包含刚创建的"Alpha"项目
3. 描述Alpha项目时信息应与之前一致
关键验证点：AI 不应该在第2轮说创建了Alpha，但第3轮又说找不到Alpha。信息必须前后一致。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('状态变化追踪 - AI应追踪实体状态的变化', async () => {
      const result = await executeMultiTurnTest({
        name: '状态变化追踪',
        description: '测试AI是否能追踪实体状态的变化',
        commands: [
          'create a task called Update Documentation',
          'what is the status of this task?',
          'mark it as completed',
          'check the status again'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 创建任务"Update Documentation"
2. 报告任务的初始状态（通常是pending或类似状态）
3. 将任务标记为已完成
4. 在第4轮时报告任务状态为"completed"
关键验证点：第4轮的状态报告应该反映第3轮的状态变更，而不是显示初始状态。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });
  });

  test.describe('上下文切换测试', () => {

    test('话题转换测试 - AI应能正确处理话题切换', async () => {
      const result = await executeMultiTurnTest({
        name: '话题转换测试',
        description: '测试AI在切换话题后是否能正确处理新上下文',
        commands: [
          'tell me about my projects',
          'actually, I want to check my tasks instead',
          'show me the high priority ones'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 介绍/列出用户的项目
2. 理解用户想要切换话题到任务，不再继续讨论项目
3. 理解"the high priority ones"指的是高优先级任务（而非项目）
关键验证点：AI 应该能正确切换上下文，第3轮的回复应该关于任务而非项目。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('多主题并行 - AI应能在多个主题间切换', async () => {
      const result = await executeMultiTurnTest({
        name: '多主题并行',
        description: '测试AI在多个主题间切换的能力',
        commands: [
          'I have a project called Website Redesign',
          'I also have a task to review the budget',
          'tell me about the website project',
          'now tell me about the budget task'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 确认/记录Website Redesign项目
2. 确认/记录budget review任务
3. 能够回忆并讨论Website Redesign项目
4. 能够切换回budget任务并讨论
关键验证点：AI 应该同时记住两个不同的主题（项目和任务），并能在用户请求时准确切换讨论对象。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });
  });

  test.describe('错误恢复测试', () => {

    test('无效输入后恢复 - AI应能从无效输入中恢复', async () => {
      const result = await executeMultiTurnTest({
        name: '无效输入后恢复',
        description: '测试AI在收到无效输入后能否继续正常对话',
        commands: [
          'list my projects',
          'xyzabc123invalid456',
          'copy the first project'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 正常列出用户的项目
2. 优雅地处理无效输入（可以询问澄清、表示不理解，但不应该崩溃或产生错误）
3. 能够恢复正常对话，理解"first project"指的是第1轮列出的项目
关键验证点：无效输入不应该破坏AI的上下文记忆，AI应该仍然记得之前列出的项目。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('澄清请求测试 - AI应在信息不明确时请求澄清', async () => {
      const result = await executeMultiTurnTest({
        name: '澄清请求测试',
        description: '测试AI在信息不明确时的处理',
        commands: [
          'create a project',
          'the name is Mobile App Development',
          'confirm the details'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 当用户只说"create a project"时，AI应该询问项目名称或其他必要信息
2. 接收到项目名称后，继续创建流程
3. 在确认时，应该展示项目的完整信息（至少包含名称"Mobile App Development"）
关键验证点：AI 不应该在信息不完整时直接创建项目，应该主动询问缺失的必要信息。`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });
  });

  test.describe('复杂对话流程测试', () => {

    test('完整项目管理流程 - 模拟真实的项目管理对话', async () => {
      const result = await executeMultiTurnTest({
        name: '完整项目管理流程',
        description: '模拟真实的项目管理对话流程',
        commands: [
          'I want to start a new marketing project',
          'add three tasks: content creation, design, and review',
          'set content creation as high priority',
          'what tasks do I have in the marketing project?',
          'mark the design task as in progress'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 理解用户想创建一个营销相关的项目（可以询问项目名或使用默认名）
2. 在该项目下创建三个任务：content creation, design, review
3. 将content creation任务设为高优先级
4. 列出该项目下的任务，应包含之前创建的三个任务及其状态
5. 将design任务状态改为in progress
关键验证点：
- AI 必须在整个流程中维护正确的项目-任务关系
- 第4轮应该能够列出所有三个任务
- 第5轮应该能识别"design task"并更新其状态`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('中断与恢复流程 - AI应能处理任务中途的打断', async () => {
      const result = await executeMultiTurnTest({
        name: '中断与恢复流程',
        description: '测试AI在任务中途被打断后能否恢复',
        commands: [
          'I want to create a new project for Q4 planning',
          'wait, first show me all existing projects',
          'ok, now continue creating the Q4 project',
          'add a task called Budget Review'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 开始创建Q4 planning项目的流程
2. 暂停创建流程，转而显示现有项目列表
3. 恢复Q4 planning项目的创建流程（记住之前的项目名）
4. 在Q4项目下添加Budget Review任务
关键验证点：
- AI 应该能暂停当前任务去执行插入的请求
- AI 应该能恢复之前的任务，不需要用户重复说明项目名
- 第4轮的任务应该添加到Q4项目下`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });

    test('纠错与修改流程 - AI应支持用户修改之前的输入', async () => {
      const result = await executeMultiTurnTest({
        name: '纠错与修改流程',
        description: '测试AI是否支持用户修改之前的输入',
        commands: [
          'create a project called Annual Report 2023',
          'wait, I meant 2024 not 2023',
          'confirm the project name',
          'add a task for data collection'
        ],
        expectedBehavior: `AI 应该展示以下能力：
1. 开始创建名为"Annual Report 2023"的项目
2. 理解用户想要更正年份，将项目名改为"Annual Report 2024"
3. 确认项目名时应显示"2024"而非"2023"
4. 在正确的项目下添加data collection任务
关键验证点：
- AI 应该理解用户的更正意图
- 更正后的项目名应该是"Annual Report 2024"
- 不应该创建两个项目`
      });

      expect(result.passed, `评估失败: ${result.reasoning}`).toBeTruthy();
    });
  });
});
