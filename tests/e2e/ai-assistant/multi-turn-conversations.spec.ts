import { test, expect } from '../../../fixtures/auth.fixture';
import { Timeouts } from '../../../fixtures/test-data';
import { ConversationManager } from '../../../utils/conversation-manager';
import {
  ContextContinuityScenarios,
  LogicConsistencyScenarios,
  ContextSwitchingScenarios,
  ErrorRecoveryScenarios,
  ComplexConversationScenarios,
  type ConversationScenario
} from '../../../fixtures/conversation-test-data';

/**
 * 多轮对话测试套件
 * 测试AI助手的上下文理解、逻辑一致性和状态管理能力
 */
test.describe('多轮对话测试', () => {
  test.use({ storageState: 'auth-state.json' });

  test.beforeEach(async ({ page, aiAssistantPage }) => {
    await page.goto('/workspace/chatbot');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    await aiAssistantPage.openAIAssistant();
  });

  /**
   * 辅助函数：运行对话场景测试
   */
  async function runConversationScenario(
    scenario: ConversationScenario,
    conversation: ConversationManager
  ) {
    console.log(`\n📝 场景: ${scenario.name}`);
    console.log(`📄 描述: ${scenario.description}\n`);

    for (const [index, turn] of scenario.turns.entries()) {
      console.log(`\n--- 第 ${index + 1} 轮对话 ---`);

      // 发送消息并追踪
      const response = await conversation.sendAndTrack(
        turn.userMessage,
        turn.expectedKeywords
      );

      // 验证响应不为空
      expect(response).not.toBe('');
      expect(response.length).toBeGreaterThan(0);

      // 验证预期关键词
      if (turn.expectedKeywords && turn.expectedKeywords.length > 0) {
        const hasKeyword = turn.expectedKeywords.some(keyword =>
          response.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) {
          console.log(`⚠️  警告: 响应中未找到预期关键词: ${turn.expectedKeywords.join(', ')}`);
        }
      }

      // 验证上下文连续性
      if (turn.contextCheck) {
        const { shouldReference, mode = 'any' } = turn.contextCheck;
        if (shouldReference.length > 0) {
          const hasContext = await conversation.verifyContextContinuity(
            response,
            shouldReference,
            { mode }
          );

          expect(hasContext).toBeTruthy();
          console.log(`✓ 上下文检查通过: 引用了 [${shouldReference.join(', ')}]`);
        }
      }

      // 验证响应质量
      if (turn.qualityCheck) {
        const qualityResult = conversation.verifyResponseQuality(
          response,
          turn.qualityCheck
        );

        if (!qualityResult.passed) {
          console.log(`⚠️  质量检查失败: ${qualityResult.failures.join('; ')}`);
        }

        expect(qualityResult.passed).toBeTruthy();
      }

      // 短暂等待，避免请求过快
      await conversation.wait(1000);
    }

    // 输出对话统计
    const stats = conversation.getStats();
    console.log(`\n📊 对话统计:`);
    console.log(`  总轮次: ${stats.totalTurns}`);
    console.log(`  平均响应时间: ${stats.avgResponseTime}ms`);
    console.log(`  错误次数: ${stats.errorsCount}`);
    console.log(`  总时长: ${stats.duration}ms`);
  }

  test.describe('上下文连续性测试', () => {
    for (const scenario of ContextContinuityScenarios) {
      test(scenario.name, async ({ page, mcpHelper, aiAssistantPage }) => {
        test.setTimeout(120000); // 2分钟

        const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

        await runConversationScenario(scenario, conversation);

        // 导出对话历史
        await conversation.exportConversation(
          `context-continuity-${scenario.name.replace(/\s+/g, '-')}`
        );

        // 验证对话轮次
        const history = conversation.getHistory();
        expect(history.length).toBe(scenario.turns.length);
      });
    }
  });

  test.describe('逻辑一致性测试', () => {
    for (const scenario of LogicConsistencyScenarios) {
      test(scenario.name, async ({ page, mcpHelper, aiAssistantPage }) => {
        test.setTimeout(120000);

        const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

        await runConversationScenario(scenario, conversation);

        await conversation.exportConversation(
          `logic-consistency-${scenario.name.replace(/\s+/g, '-')}`
        );

        const history = conversation.getHistory();
        expect(history.length).toBe(scenario.turns.length);
      });
    }
  });

  test.describe('上下文切换测试', () => {
    for (const scenario of ContextSwitchingScenarios) {
      test(scenario.name, async ({ page, mcpHelper, aiAssistantPage }) => {
        test.setTimeout(120000);

        const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

        await runConversationScenario(scenario, conversation);

        await conversation.exportConversation(
          `context-switching-${scenario.name.replace(/\s+/g, '-')}`
        );

        const history = conversation.getHistory();
        expect(history.length).toBe(scenario.turns.length);
      });
    }
  });

  test.describe('错误恢复测试', () => {
    for (const scenario of ErrorRecoveryScenarios) {
      test(scenario.name, async ({ page, mcpHelper, aiAssistantPage }) => {
        test.setTimeout(120000);

        const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

        await runConversationScenario(scenario, conversation);

        await conversation.exportConversation(
          `error-recovery-${scenario.name.replace(/\s+/g, '-')}`
        );

        const history = conversation.getHistory();
        expect(history.length).toBe(scenario.turns.length);
      });
    }
  });

  test.describe('复杂对话流程测试', () => {
    for (const scenario of ComplexConversationScenarios) {
      test(scenario.name, async ({ page, mcpHelper, aiAssistantPage }) => {
        test.setTimeout(180000); // 3分钟

        const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

        await runConversationScenario(scenario, conversation);

        await conversation.exportConversation(
          `complex-${scenario.name.replace(/\s+/g, '-')}`
        );

        const history = conversation.getHistory();
        expect(history.length).toBe(scenario.turns.length);

        // 验证复杂对话的额外指标
        const stats = conversation.getStats();
        expect(stats.avgResponseTime).toBeLessThan(15000); // 平均响应时间不超过15秒
      });
    }
  });

  test('自定义上下文验证测试 @smoke', async ({ page, mcpHelper, aiAssistantPage }) => {
    test.setTimeout(90000);

    const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

    // 第1轮：建立初始上下文
    const r1 = await conversation.sendAndTrack('I have a project called Dashboard Redesign');
    expect(r1.toLowerCase()).toMatch(/dashboard|redesign|project/);

    await conversation.wait(1500);

    // 第2轮：使用代词引用
    const r2 = await conversation.sendAndTrack('add a task to it');
    const hasContext = await conversation.verifyContextContinuity(
      r2,
      ['dashboard', 'redesign', 'project'],
      { mode: 'any' }
    );
    expect(hasContext).toBeTruthy();

    await conversation.wait(1500);

    // 第3轮：继续引用
    const r3 = await conversation.sendAndTrack('what is the status of this task?');
    const hasTaskContext = await conversation.verifyContextContinuity(
      r3,
      ['task'],
      { mode: 'any' }
    );
    expect(hasTaskContext).toBeTruthy();

    // 验证响应质量
    const qualityCheck = conversation.verifyResponseQuality(r3, {
      minLength: 10,
      requiredKeywords: ['status'],
      forbiddenPhrases: ['error', 'sorry, I cannot']
    });

    console.log(`\n质量检查结果:`);
    console.log(`  通过: ${qualityCheck.passed}`);
    if (!qualityCheck.passed) {
      console.log(`  失败原因: ${qualityCheck.failures.join('; ')}`);
    }

    // 导出对话
    await conversation.exportConversation('custom-context-verification');

    // 验证统计
    const stats = conversation.getStats();
    expect(stats.totalTurns).toBe(3);
    console.log(`\n对话统计: ${JSON.stringify(stats, null, 2)}`);
  });

  test('响应质量综合测试', async ({ page, mcpHelper, aiAssistantPage }) => {
    test.setTimeout(60000);

    const conversation = new ConversationManager(page, mcpHelper, aiAssistantPage);

    const response = await conversation.sendAndTrack('explain what projects are available');

    // 多维度质量检查
    const qualityChecks = [
      conversation.verifyResponseQuality(response, {
        minLength: 20,
        minWords: 5
      }),
      conversation.verifyResponseQuality(response, {
        requiredKeywords: ['project']
      }),
      conversation.verifyResponseQuality(response, {
        forbiddenPhrases: ['error', 'failed', 'cannot process']
      })
    ];

    const allPassed = qualityChecks.every(check => check.passed);
    expect(allPassed).toBeTruthy();

    if (!allPassed) {
      const failures = qualityChecks.flatMap(check => check.failures);
      console.log(`质量检查失败: ${failures.join('; ')}`);
    }

    await conversation.exportConversation('response-quality-comprehensive');
  });
});
