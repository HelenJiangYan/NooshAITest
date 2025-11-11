import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * Playwright配置 - Noosh AI测试
 * 集成MCP协议进行智能测试
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',

  // 全局超时设置
  timeout: 30 * 1000, // 30秒

  // 每个测试的期望超时
  expect: {
    timeout: 10 * 1000, // 10秒
  },

  // 失败重试次数
  retries: process.env.CI ? 2 : 1,

  // 并行worker数量
  workers: process.env.CI ? 2 : 4,

  // 测试报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    // Allure Report - 精美的可视化测试报告
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
      categories: [
        {
          name: 'UI测试失败',
          matchedStatuses: ['failed'],
        },
        {
          name: 'API测试失败',
          matchedStatuses: ['broken'],
        },
      ],
      environmentInfo: {
        'Node版本': process.version,
        '环境': process.env.CI ? 'CI' : '本地',
        '基础URL': process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com',
      },
    }],
  ],

  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.BASE_URL || 'https://nooshchat.qa2.noosh.com',

    // 浏览器选项
    headless: process.env.HEADLESS !== 'false',

    // 视口大小
    viewport: { width: 1920, height: 1080 },

    // 操作超时
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,

    // 截图配置
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // Trace追踪
    trace: 'retain-on-failure',

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 浏览器上下文选项
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  // 多项目配置
  projects: [
    // // 冒烟测试 - Chromium
    // {
    //   name: 'chromium-smoke',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //   },
    //   grep: /@smoke/,
    // },

    // 完整回归测试 - Chromium
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // // Firefox浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // // 移动端测试
    // {
    //   name: 'mobile-chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
  ],

  // 全局设置和清理
  globalSetup: require.resolve('./config/global-setup.ts'),
  globalTeardown: require.resolve('./config/global-teardown.ts'),

  // 输出目录
  outputDir: 'test-results/',
});
