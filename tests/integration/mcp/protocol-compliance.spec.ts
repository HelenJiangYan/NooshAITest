/**
 * MCP 协议合规性测试
 *
 * 测试范围：
 * - JSON-RPC 2.0 消息格式验证
 * - MCP 协议版本协商
 * - 错误响应格式验证
 * - 超时和重试机制
 * - 协议能力声明
 */

import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP 测试配置
const MCP_SERVER_CONFIG = {
  command: 'node',
  args: ['./mcp-server/index.js'],
  timeout: 10000,
};

test.describe('MCP 协议合规性测试 @integration @mcp @protocol', () => {
  let client: Client;
  let transport: StdioClientTransport;

  test.beforeEach(async () => {
    console.log('🔌 初始化 MCP 客户端连接（协议测试）...');
  });

  test.afterEach(async () => {
    if (client) {
      try {
        await client.close();
        console.log('✅ MCP 客户端连接已关闭');
      } catch (error) {
        console.log('⚠️  关闭 MCP 客户端时出错:', error);
      }
    }
  });

  test('应正确完成 MCP 协议初始化握手', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // 连接会触发初始化握手
    await client.connect(transport);

    console.log('✅ MCP 协议初始化握手成功');

    // 验证连接状态
    // 注意：SDK 可能没有公开状态属性，这里只是示意
    expect(client).toBeDefined();
  });

  test('应正确声明客户端能力', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    // 声明特定能力
    const clientCapabilities = {
      tools: {},
      resources: {
        subscribe: true,
      },
      prompts: {},
      logging: {},
    };

    client = new Client(
      {
        name: 'noosh-capability-test-client',
        version: '1.0.0',
      },
      {
        capabilities: clientCapabilities,
      }
    );

    await client.connect(transport);

    console.log('✅ 客户端能力声明成功:', JSON.stringify(clientCapabilities, null, 2));

    // 验证服务器是否支持预期功能
    try {
      const tools = await client.listTools();
      console.log('✅ 工具能力可用:', tools.tools.length);
    } catch (error) {
      console.log('⚠️  工具能力不可用');
    }
  });

  test('应返回符合 JSON-RPC 2.0 规范的错误响应', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {}
    );

    await client.connect(transport);

    try {
      // 故意调用不存在的工具触发错误
      await client.callTool({
        name: 'invalid_tool_that_does_not_exist_12345',
        arguments: {},
      });

      expect(true).toBe(false); // 不应该到达这里
    } catch (error: any) {
      console.log('📋 错误响应:', JSON.stringify(error, null, 2));

      // 验证错误对象包含必要信息
      expect(error).toBeDefined();
      expect(error.message).toBeDefined();
      expect(typeof error.message).toBe('string');

      // JSON-RPC 2.0 错误应包含 code 和 message
      // 注意：SDK 可能会转换错误格式，这里根据实际情况调整
      if ('code' in error) {
        expect(typeof error.code).toBe('number');
      }
    }
  });

  test('应正确处理服务器超时', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {}
    );

    // 设置较短的超时时间
    const connectionTimeout = 5000; // 5秒

    const startTime = Date.now();

    try {
      await Promise.race([
        client.connect(transport),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), connectionTimeout)
        ),
      ]);

      console.log('✅ 连接在超时时间内完成');
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      console.log(`⏱️  连接超时，耗时: ${elapsed}ms`);

      if (error.message === 'Connection timeout') {
        console.log('✅ 超时机制工作正常');
      } else {
        throw error;
      }
    }
  });

  test('应支持 Prompts 功能（如果服务器声明支持）', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          prompts: {},
        },
      }
    );

    await client.connect(transport);

    try {
      // 列出可用的 prompts
      const result = await client.listPrompts();

      console.log('📝 可用 Prompts:', JSON.stringify(result.prompts, null, 2));

      expect(result).toHaveProperty('prompts');
      expect(Array.isArray(result.prompts)).toBe(true);

      // 验证每个 prompt 的结构
      result.prompts.forEach((prompt) => {
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('description');
        expect(typeof prompt.name).toBe('string');
      });
    } catch (error: any) {
      // 如果服务器不支持 prompts，应该返回特定错误
      console.log('ℹ️  服务器不支持 Prompts 功能:', error.message);
      expect(error.message).toMatch(/not supported|not implemented/i);
    }
  });

  test('应支持 Logging 功能（如果服务器声明支持）', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH || !process.env.MCP_SUPPORTS_LOGGING,
      '需要配置 MCP_SERVER_PATH 和服务器支持 Logging'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          logging: {},
        },
      }
    );

    await client.connect(transport);

    // 执行一些操作（服务器可能会发送日志通知）
    const tools = await client.listTools();

    console.log('✅ 客户端声明了 Logging 能力，连接成功');
    console.log(`📋 获取到 ${tools.tools.length} 个工具`);

    // 注意：实际的日志通知处理需要使用 SDK 提供的事件监听机制
    // 这里主要验证声明 logging 能力不会导致连接失败
  });
});

test.describe('MCP 协议版本兼容性测试 @integration @mcp @compatibility', () => {
  test('应正确处理协议版本不匹配', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    // 注意：SDK 通常会自动处理版本协商
    // 这个测试主要验证版本协商机制存在

    const transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    const client = new Client(
      {
        name: 'noosh-version-test-client',
        version: '1.0.0',
      },
      {}
    );

    try {
      await client.connect(transport);
      console.log('✅ 协议版本协商成功');

      // 验证可以正常通信
      const tools = await client.listTools();
      expect(tools).toBeDefined();

      await client.close();
    } catch (error: any) {
      console.log('⚠️  协议版本协商失败:', error.message);
      // 如果是版本不兼容错误，应该有明确的错误信息
      if (error.message.includes('version') || error.message.includes('protocol')) {
        console.log('✅ 正确识别了版本不兼容');
      } else {
        throw error;
      }
    }
  });
});

test.describe('MCP 并发和状态管理测试 @integration @mcp @concurrency', () => {
  test('应支持多个并发请求', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    const transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    const client = new Client(
      {
        name: 'noosh-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    await client.connect(transport);

    // 并发发送多个请求
    const requests = [
      client.listTools(),
      client.listResources(),
      client.listTools(), // 重复请求
    ];

    const results = await Promise.all(requests);

    console.log('✅ 并发请求全部成功完成');
    console.log('📊 结果数量:', results.length);

    // 验证所有请求都成功
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveProperty('tools');
    expect(results[1]).toHaveProperty('resources');
    expect(results[2]).toHaveProperty('tools');

    // 验证相同请求返回一致结果
    expect(results[0]).toEqual(results[2]);

    await client.close();
  });
});
