/**
 * 测试数据配置
 * 集中管理所有测试用例使用的数据
 */

export const TestUsers = {
  standard: {
    username: process.env.TEST_USERNAME || 'dgo1g1mgr1',
    password: process.env.TEST_PASSWORD || 'noosh123',
    role: 'user',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  },
};

/**
 * AI命令测试数据
 */
export const AITestCommands = {
  projectCommands: [
    {
      command: 'copy project',
      description: '复制项目',
      expectedKeywords: ['复制', '成功', 'copy', 'success', '项目'],
      category: 'project',
      priority: 'high',
    },
    {
      command: 'create new project',
      description: '创建新项目',
      expectedKeywords: ['创建', '新项目', 'create', 'project'],
      category: 'project',
      priority: 'high',
    },
    {
      command: 'list all projects',
      description: '列出所有项目',
      expectedKeywords: ['项目', '列表', 'project', 'list'],
      category: 'project',
      priority: 'medium',
    },
  ],

  taskCommands: [
    {
      command: 'create task',
      description: '创建任务',
      expectedKeywords: ['任务', '创建', 'task', 'create'],
      category: 'task',
      priority: 'high',
    },
    {
      command: 'list all tasks',
      description: '列出所有任务',
      expectedKeywords: ['任务', '列表', 'task', 'list'],
      category: 'task',
      priority: 'medium',
    },
  ],

  generalCommands: [
    {
      command: 'help',
      description: '获取帮助',
      expectedKeywords: ['帮助', '命令', 'help', 'command'],
      category: 'general',
      priority: 'high',
    },
    {
      command: 'check status',
      description: '检查状态',
      expectedKeywords: ['状态', 'status', '正常'],
      category: 'general',
      priority: 'medium',
    },
  ],
};

/**
 * 超时配置
 */
export const Timeouts = {
  short: 5000,
  medium: 15000,
  long: 30000,
  aiResponse: parseInt(process.env.AI_RESPONSE_TIMEOUT || '10000'),
  navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
};

/**
 * 测试环境URL
 */
export const URLs = {
  base: process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com',
  login: '/workspace/chatbot',
  workspace: '/workspace',
};
