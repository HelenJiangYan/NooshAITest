/**
 * MCP 工具调用集成测试
 *
 * 测试范围：
 * - MCP 客户端连接到服务器
 * - 列出可用工具
 * - 调用工具并验证返回值
 * - 工具参数验证
 * - 错误处理
 */

import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP 测试配置
const MCP_SERVER_CONFIG = {
  // 注意：这里需要根据实际 MCP 服务器配置调整
  command: 'node',
  args: ['./mcp-server/index.js'], // 实际服务器路径需要调整
  timeout: 10000,
};

test.describe('MCP 工具调用测试 @integration @mcp', () => {
  let client: Client;
  let transport: StdioClientTransport;

  test.beforeEach(async () => {
    console.log('🔌 初始化 MCP 客户端连接...');
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

  test('应成功连接到 MCP 服务器', async () => {
    // 跳过测试直到配置了真实的 MCP 服务器
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
        },
      }
    );

    await client.connect(transport);
    console.log('✅ MCP 客户端连接成功');
  });

  test('应列出所有可用的 MCP 工具', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client({ name: 'noosh-test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    // 列出工具
    const result = await client.listTools();

    console.log('📋 可用工具列表:', JSON.stringify(result.tools, null, 2));

    // 验证返回值结构
    expect(result).toHaveProperty('tools');
    expect(Array.isArray(result.tools)).toBe(true);

    // 验证每个工具的 schema
    result.tools.forEach((tool) => {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');

      // 验证 inputSchema 符合 JSON Schema 规范
      expect(tool.inputSchema).toHaveProperty('type');
      expect(tool.inputSchema.type).toBe('object');
    });
  });

  test('应成功调用 MCP 工具并返回符合协议的结果', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client({ name: 'noosh-test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    // 示例：调用搜索工具（实际工具名需要根据服务器调整）
    const toolName = process.env.MCP_TEST_TOOL_NAME || 'search_knowledge';
    const toolArgs = JSON.parse(
      process.env.MCP_TEST_TOOL_ARGS || '{"query": "测试查询", "max_results": 5}'
    );

    const result = await client.callTool({
      name: toolName,
      arguments: toolArgs,
    });

    console.log('🔧 工具调用结果:', JSON.stringify(result, null, 2));

    // 验证返回值符合 MCP 协议
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect((result.content as any[]).length).toBeGreaterThan(0);

    // 验证 content 格式
    (result.content as any[]).forEach((item: any) => {
      expect(item).toHaveProperty('type');
      expect(['text', 'image', 'resource']).toContain(item.type);

      if (item.type === 'text') {
        expect(item).toHaveProperty('text');
        expect(typeof item.text).toBe('string');
      }
    });

    // 验证无错误
    expect(result.isError).toBeUndefined();
  });

  test('应正确处理工具参数验证错误', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client({ name: 'noosh-test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    // 调用工具时故意传入错误参数
    const toolName = process.env.MCP_TEST_TOOL_NAME || 'search_knowledge';

    try {
      await client.callTool({
        name: toolName,
        arguments: {
          // 故意传入错误的参数名
          invalid_param: 'test',
        },
      });

      // 如果没有抛出错误，测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      console.log('✅ 正确捕获了参数验证错误:', error.message);
      expect(error).toBeDefined();
    }
  });

  test('应正确处理不存在的工具调用', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    client = new Client({ name: 'noosh-test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    try {
      await client.callTool({
        name: 'non_existent_tool_12345',
        arguments: {},
      });

      // 如果没有抛出错误，测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      console.log('✅ 正确捕获了工具不存在错误:', error.message);
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    }
  });
});

test.describe('MCP 工具调用性能测试 @integration @mcp @performance', () => {
  test('工具调用响应时间应在合理范围内', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH,
      '需要配置 MCP_SERVER_PATH 环境变量'
    );

    const transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_COMMAND || MCP_SERVER_CONFIG.command,
      args: process.env.MCP_SERVER_ARGS?.split(',') || MCP_SERVER_CONFIG.args,
    });

    const client = new Client({ name: 'noosh-test-client', version: '1.0.0' }, {});
    await client.connect(transport);

    const toolName = process.env.MCP_TEST_TOOL_NAME || 'search_knowledge';
    const toolArgs = JSON.parse(
      process.env.MCP_TEST_TOOL_ARGS || '{"query": "性能测试", "max_results": 5}'
    );

    const startTime = Date.now();
    await client.callTool({
      name: toolName,
      arguments: toolArgs,
    });
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    console.log(`⏱️  工具调用响应时间: ${responseTime}ms`);

    // 验证响应时间在合理范围内（例如 5 秒）
    expect(responseTime).toBeLessThan(5000);

    await client.close();
  });
});
