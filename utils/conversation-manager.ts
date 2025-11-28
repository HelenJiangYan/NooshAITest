import { Page } from '@playwright/test';
import { MCPHelper } from './mcp-helper';
import { AIAssistantPage } from '../pages';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 对话历史记录接口
 */
export interface ConversationTurn {
  user: string;
  assistant: string;
  timestamp: number;
  metadata?: {
    responseTime?: number;
    keywords?: string[];
    hasError?: boolean;
  };
}

/**
 * 对话管理器类
 * 用于追踪和管理多轮AI对话测试
 */
export class ConversationManager {
  private conversationHistory: ConversationTurn[] = [];
  private conversationStartTime: number;

  constructor(
    private page: Page,
    private mcpHelper: MCPHelper,
    private aiAssistantPage: AIAssistantPage
  ) {
    this.conversationStartTime = Date.now();
  }

  /**
   * 发送消息并追踪到历史记录
   */
  async sendAndTrack(userMessage: string, expectedKeywords?: string[]): Promise<string> {
    const startTime = Date.now();

    // 发送命令
    await this.mcpHelper.sendCommand(userMessage);
    await this.aiAssistantPage.waitForResponse();

    // 获取响应
    const response = await this.aiAssistantPage.getLastMessageText();
    const responseTime = Date.now() - startTime;

    // 记录到历史
    this.conversationHistory.push({
      user: userMessage,
      assistant: response,
      timestamp: Date.now(),
      metadata: {
        responseTime,
        keywords: expectedKeywords,
        hasError: response.toLowerCase().includes('error') || response.toLowerCase().includes('sorry')
      }
    });

    console.log(`[对话 #${this.conversationHistory.length}]`);
    console.log(`  用户: ${userMessage}`);
    console.log(`  响应: ${response.substring(0, 100)}...`);
    console.log(`  耗时: ${responseTime}ms`);

    return response;
  }

  /**
   * 验证上下文连续性
   * 检查当前响应是否引用了之前对话中的上下文
   */
  async verifyContextContinuity(
    currentResponse: string,
    previousContext: string[],
    options: {
      mode?: 'any' | 'all';
      caseInsensitive?: boolean;
    } = {}
  ): Promise<boolean> {
    const { mode = 'any', caseInsensitive = true } = options;

    const normalize = (text: string) =>
      caseInsensitive ? text.toLowerCase() : text;

    const normalizedResponse = normalize(currentResponse);
    const normalizedContext = previousContext.map(normalize);

    if (mode === 'all') {
      return normalizedContext.every(context =>
        normalizedResponse.includes(context)
      );
    } else {
      return normalizedContext.some(context =>
        normalizedResponse.includes(context)
      );
    }
  }

  /**
   * 验证响应质量
   */
  verifyResponseQuality(response: string, criteria: {
    minLength?: number;
    minWords?: number;
    requiredKeywords?: string[];
    forbiddenPhrases?: string[];
  } = {}): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    // 检查最小长度
    if (criteria.minLength && response.length < criteria.minLength) {
      failures.push(`响应太短: ${response.length} < ${criteria.minLength}`);
    }

    // 检查最小单词数
    if (criteria.minWords) {
      const wordCount = response.split(/\s+/).length;
      if (wordCount < criteria.minWords) {
        failures.push(`单词数不足: ${wordCount} < ${criteria.minWords}`);
      }
    }

    // 检查必需关键词
    if (criteria.requiredKeywords) {
      const missingKeywords = criteria.requiredKeywords.filter(
        keyword => !response.toLowerCase().includes(keyword.toLowerCase())
      );
      if (missingKeywords.length > 0) {
        failures.push(`缺少关键词: ${missingKeywords.join(', ')}`);
      }
    }

    // 检查禁止短语
    if (criteria.forbiddenPhrases) {
      const foundForbidden = criteria.forbiddenPhrases.filter(
        phrase => response.toLowerCase().includes(phrase.toLowerCase())
      );
      if (foundForbidden.length > 0) {
        failures.push(`包含禁止短语: ${foundForbidden.join(', ')}`);
      }
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }

  /**
   * 获取完整对话历史
   */
  getHistory(): ConversationTurn[] {
    return this.conversationHistory;
  }

  /**
   * 获取对话统计信息
   */
  getStats() {
    const totalTurns = this.conversationHistory.length;
    const avgResponseTime = totalTurns > 0
      ? this.conversationHistory.reduce((sum, turn) => sum + (turn.metadata?.responseTime || 0), 0) / totalTurns
      : 0;
    const errorsCount = this.conversationHistory.filter(turn => turn.metadata?.hasError).length;

    return {
      totalTurns,
      avgResponseTime: Math.round(avgResponseTime),
      errorsCount,
      duration: Date.now() - this.conversationStartTime
    };
  }

  /**
   * 导出对话历史到 JSON 文件
   */
  async exportConversation(filename: string, includeScreenshot: boolean = true): Promise<void> {
    const exportDir = path.join(process.cwd(), 'test-results', 'conversations');

    // 确保目录存在
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = filename || `conversation-${timestamp}`;

    // 导出 JSON
    const jsonPath = path.join(exportDir, `${baseFilename}.json`);
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        stats: this.getStats()
      },
      conversation: this.conversationHistory
    };

    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));
    console.log(`\n✓ 对话历史已导出: ${jsonPath}`);

    // 导出截图
    if (includeScreenshot) {
      const screenshotPath = path.join(exportDir, `${baseFilename}.png`);
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`✓ 对话截图已保存: ${screenshotPath}`);
    }
  }

  /**
   * 清除对话历史
   */
  clear(): void {
    this.conversationHistory = [];
    this.conversationStartTime = Date.now();
  }

  /**
   * 从历史中提取关键信息
   * 用于在后续对话中引用
   */
  extractContextFromHistory(keywords: string[]): string[] {
    const extracted: string[] = [];

    for (const turn of this.conversationHistory) {
      for (const keyword of keywords) {
        if (turn.assistant.toLowerCase().includes(keyword.toLowerCase())) {
          // 提取包含关键词的句子
          const sentences = turn.assistant.split(/[.!?]/);
          const relevantSentence = sentences.find(s =>
            s.toLowerCase().includes(keyword.toLowerCase())
          );
          if (relevantSentence) {
            extracted.push(relevantSentence.trim());
          }
        }
      }
    }

    return extracted;
  }

  /**
   * 等待一段时间（用于避免请求过快）
   */
  async wait(ms: number = 1000): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
