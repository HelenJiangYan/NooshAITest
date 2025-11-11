/**
 * 多轮对话测试数据
 * 定义各种对话场景和预期行为
 */

export interface ConversationScenario {
  name: string;
  description: string;
  turns: ConversationTurn[];
}

export interface ConversationTurn {
  userMessage: string;
  expectedKeywords?: string[];
  contextCheck?: {
    shouldReference: string[];
    mode?: 'any' | 'all';
  };
  qualityCheck?: {
    minLength?: number;
    minWords?: number;
    forbiddenPhrases?: string[];
  };
}

/**
 * 上下文连续性测试场景
 */
export const ContextContinuityScenarios: ConversationScenario[] = [
  {
    name: '代词引用测试',
    description: '测试AI是否能理解代词引用之前提到的内容',
    turns: [
      {
        userMessage: 'list all my projects',
        expectedKeywords: ['project', 'Projects Associated'],
        qualityCheck: { minLength: 100 }
      },
      {
        userMessage: 'copy the first one',
        expectedKeywords: ['copy', 'duplicate', 'clone'],
        contextCheck: {
          shouldReference: ['project'],
          mode: 'any'
        }
      },
      {
        userMessage: 'what is its status?',
        expectedKeywords: ['status'],
        contextCheck: {
          shouldReference: ['project'],
          mode: 'any'
        }
      }
    ]
  },
  {
    name: '跨多轮状态记忆',
    description: '测试AI是否能记住3轮以上的对话上下文',
    turns: [
      {
        userMessage: 'create a new project called Marketing Campaign 2024',
        expectedKeywords: ['marketing', 'campaign', '2024']
      },
      {
        userMessage: 'add a task named Design Review',
        expectedKeywords: ['task', 'design', 'review'],
        contextCheck: {
          shouldReference: ['marketing'],
          mode: 'any'
        }
      },
      {
        userMessage: 'set the priority to high',
        expectedKeywords: ['priority', 'high'],
        contextCheck: {
          shouldReference: ['task', 'design'],
          mode: 'any'
        }
      },
      {
        userMessage: 'assign it to John',
        expectedKeywords: ['assign', 'john'],
        contextCheck: {
          shouldReference: ['task', 'design'],
          mode: 'any'
        }
      },
      {
        userMessage: 'when is the deadline for this task?',
        expectedKeywords: ['deadline', 'date'],
        contextCheck: {
          shouldReference: ['design', 'review'],
          mode: 'any'
        }
      }
    ]
  }
];

/**
 * 逻辑一致性测试场景
 */
export const LogicConsistencyScenarios: ConversationScenario[] = [
  {
    name: '信息不矛盾测试',
    description: '测试AI前后回答的一致性',
    turns: [
      {
        userMessage: 'create a project named Alpha',
        expectedKeywords: ['alpha', 'project', 'create']
      },
      {
        userMessage: 'what projects do I have?',
        expectedKeywords: ['alpha'],
        contextCheck: {
          shouldReference: ['alpha'],
          mode: 'any'
        }
      },
      {
        userMessage: 'tell me about project Alpha',
        expectedKeywords: ['alpha'],
        contextCheck: {
          shouldReference: ['project'],
          mode: 'any'
        }
      }
    ]
  },
  {
    name: '状态变化追踪',
    description: '测试AI是否能追踪实体状态的变化',
    turns: [
      {
        userMessage: 'create a task called Update Documentation',
        expectedKeywords: ['task', 'documentation', 'update']
      },
      {
        userMessage: 'what is the status of this task?',
        expectedKeywords: ['status'],
        contextCheck: {
          shouldReference: ['task', 'documentation'],
          mode: 'any'
        }
      },
      {
        userMessage: 'mark it as completed',
        expectedKeywords: ['complet', 'done', 'finish'],
        contextCheck: {
          shouldReference: ['task'],
          mode: 'any'
        }
      },
      {
        userMessage: 'check the status again',
        expectedKeywords: ['status', 'complet'],
        contextCheck: {
          shouldReference: ['task'],
          mode: 'any'
        }
      }
    ]
  }
];

/**
 * 上下文切换测试场景
 */
export const ContextSwitchingScenarios: ConversationScenario[] = [
  {
    name: '话题转换测试',
    description: '测试AI在切换话题后是否能正确处理新上下文',
    turns: [
      {
        userMessage: 'tell me about my projects',
        expectedKeywords: ['project']
      },
      {
        userMessage: 'actually, I want to check my tasks instead',
        expectedKeywords: ['task'],
        contextCheck: {
          shouldReference: [], // 不应该过多引用项目
          mode: 'any'
        }
      },
      {
        userMessage: 'show me the high priority ones',
        expectedKeywords: ['priority', 'high', 'task'],
        contextCheck: {
          shouldReference: ['task'],
          mode: 'any'
        }
      }
    ]
  },
  {
    name: '多主题并行',
    description: '测试AI在多个主题间切换的能力',
    turns: [
      {
        userMessage: 'I have a project called Website Redesign',
        expectedKeywords: ['website', 'redesign', 'project']
      },
      {
        userMessage: 'I also have a task to review the budget',
        expectedKeywords: ['task', 'budget', 'review']
      },
      {
        userMessage: 'tell me about the website project',
        expectedKeywords: ['website', 'redesign'],
        contextCheck: {
          shouldReference: ['website', 'redesign'],
          mode: 'any'
        }
      },
      {
        userMessage: 'now tell me about the budget task',
        expectedKeywords: ['budget', 'task'],
        contextCheck: {
          shouldReference: ['budget', 'task'],
          mode: 'any'
        }
      }
    ]
  }
];

/**
 * 错误恢复测试场景
 */
export const ErrorRecoveryScenarios: ConversationScenario[] = [
  {
    name: '无效输入后恢复',
    description: '测试AI在收到无效输入后能否继续正常对话',
    turns: [
      {
        userMessage: 'list my projects',
        expectedKeywords: ['project']
      },
      {
        userMessage: 'xyzabc123invalid456',
        expectedKeywords: [], // 无效输入
        qualityCheck: {
          forbiddenPhrases: [] // 不应该崩溃
        }
      },
      {
        userMessage: 'copy the first project',
        expectedKeywords: ['copy', 'project'],
        contextCheck: {
          shouldReference: ['project'],
          mode: 'any'
        }
      }
    ]
  },
  {
    name: '澄清请求测试',
    description: '测试AI在信息不明确时的处理',
    turns: [
      {
        userMessage: 'create a project',
        expectedKeywords: ['project', 'name'] // 应该询问项目名
      },
      {
        userMessage: 'the name is Mobile App Development',
        expectedKeywords: ['mobile', 'app', 'development'],
        contextCheck: {
          shouldReference: ['project'],
          mode: 'any'
        }
      },
      {
        userMessage: 'confirm the details',
        expectedKeywords: ['mobile', 'app', 'development'],
        contextCheck: {
          shouldReference: ['mobile', 'app'],
          mode: 'any'
        }
      }
    ]
  }
];

/**
 * 复杂对话流程测试场景
 */
export const ComplexConversationScenarios: ConversationScenario[] = [
  {
    name: '完整项目管理流程',
    description: '模拟真实的项目管理对话流程',
    turns: [
      {
        userMessage: 'I want to start a new marketing project',
        expectedKeywords: ['marketing', 'project']
      },
      {
        userMessage: 'add three tasks: content creation, design, and review',
        expectedKeywords: ['task', 'content', 'design', 'review'],
        contextCheck: {
          shouldReference: ['project', 'marketing'],
          mode: 'any'
        }
      },
      {
        userMessage: 'set content creation as high priority',
        expectedKeywords: ['content', 'priority', 'high'],
        contextCheck: {
          shouldReference: ['task'],
          mode: 'any'
        }
      },
      {
        userMessage: 'what tasks do I have in the marketing project?',
        expectedKeywords: ['task', 'marketing', 'content', 'design', 'review'],
        contextCheck: {
          shouldReference: ['marketing', 'project'],
          mode: 'all'
        }
      },
      {
        userMessage: 'mark the design task as in progress',
        expectedKeywords: ['design', 'progress'],
        contextCheck: {
          shouldReference: ['task'],
          mode: 'any'
        }
      }
    ]
  }
];

/**
 * 所有场景的集合
 */
export const AllConversationScenarios = {
  contextContinuity: ContextContinuityScenarios,
  logicConsistency: LogicConsistencyScenarios,
  contextSwitching: ContextSwitchingScenarios,
  errorRecovery: ErrorRecoveryScenarios,
  complex: ComplexConversationScenarios
};
