/**
 * MCP 资源访问集成测试
 *
 * 测试范围：
 * - 列出可用资源
 * - 读取资源内容
 * - 资源权限验证
 * - 资源订阅和更新通知
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

test.describe('MCP 资源访问测试 @integration @mcp', () => {
  let client: Client;
  let transport: StdioClientTransport;

  test.beforeEach(async () => {
    console.log('🔌 初始化 MCP 客户端连接（资源访问测试）...');
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

  test('应列出所有可用的 MCP 资源', async () => {
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
          resources: {},
        },
      }
    );

    await client.connect(transport);

    // 列出资源
    const result = await client.listResources();

    console.log('📚 可用资源列表:', JSON.stringify(result.resources, null, 2));

    // 验证返回值结构
    expect(result).toHaveProperty('resources');
    expect(Array.isArray(result.resources)).toBe(true);

    // 验证每个资源的 schema
    result.resources.forEach((resource) => {
      expect(resource).toHaveProperty('uri');
      expect(resource).toHaveProperty('name');
      expect(typeof resource.uri).toBe('string');
      expect(typeof resource.name).toBe('string');

      // URI 应该是有效格式
      expect(resource.uri).toMatch(/^[a-z]+:\/\/.+/);
    });
  });

  test('应成功读取资源内容', async () => {
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
          resources: {},
        },
      }
    );

    await client.connect(transport);

    // 先列出资源
    const listResult = await client.listResources();
    expect(listResult.resources.length).toBeGreaterThan(0);

    // 读取第一个资源
    const resourceUri = listResult.resources[0].uri;
    const readResult = await client.readResource({
      uri: resourceUri,
    });

    console.log('📖 资源内容:', JSON.stringify(readResult, null, 2));

    // 验证返回值符合 MCP 协议
    expect(readResult).toHaveProperty('contents');
    expect(Array.isArray(readResult.contents)).toBe(true);
    expect(readResult.contents.length).toBeGreaterThan(0);

    // 验证 content 格式
    readResult.contents.forEach((item) => {
      expect(item).toHaveProperty('uri');
      expect(item).toHaveProperty('mimeType');

      // 应该包含 text 或 blob 之一
      const hasText = 'text' in item;
      const hasBlob = 'blob' in item;
      expect(hasText || hasBlob).toBe(true);
    });
  });

  test('应正确处理不存在的资源读取', async () => {
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
          resources: {},
        },
      }
    );

    await client.connect(transport);

    try {
      await client.readResource({
        uri: 'file:///non_existent_resource_12345.txt',
      });

      // 如果没有抛出错误，测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      console.log('✅ 正确捕获了资源不存在错误:', error.message);
      expect(error).toBeDefined();
    }
  });

  test('应支持资源模板和变量替换', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH || !process.env.MCP_TEST_RESOURCE_TEMPLATE,
      '需要配置 MCP_SERVER_PATH 和 MCP_TEST_RESOURCE_TEMPLATE 环境变量'
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
          resources: {},
        },
      }
    );

    await client.connect(transport);

    // 列出资源模板
    const listResult = await client.listResourceTemplates();

    console.log('📝 资源模板列表:', JSON.stringify(listResult.resourceTemplates, null, 2));

    expect(listResult).toHaveProperty('resourceTemplates');
    expect(Array.isArray(listResult.resourceTemplates)).toBe(true);

    // 验证模板结构
    listResult.resourceTemplates.forEach((template) => {
      expect(template).toHaveProperty('uriTemplate');
      expect(template).toHaveProperty('name');

      // URI 模板应该包含变量占位符 {variable}
      if (template.uriTemplate.includes('{')) {
        expect(template.uriTemplate).toMatch(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/);
      }
    });
  });
});

test.describe('MCP 资源订阅测试 @integration @mcp', () => {
  test('应支持订阅资源更新通知', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH || !process.env.MCP_SUPPORTS_SUBSCRIPTIONS,
      '需要配置 MCP_SERVER_PATH 和服务器支持订阅功能'
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
          resources: {
            subscribe: true,
          },
        },
      }
    );

    await client.connect(transport);

    // 订阅资源更新
    const resourceUri = process.env.MCP_TEST_RESOURCE_URI || 'file:///test/resource.txt';

    const subscribeResult = await client.subscribeResource({
      uri: resourceUri,
    });

    console.log('🔔 订阅结果:', JSON.stringify(subscribeResult, null, 2));

    // 验证订阅成功（协议未定义返回值，检查无错误即可）
    expect(subscribeResult).toBeDefined();

    // 取消订阅
    await client.unsubscribeResource({
      uri: resourceUri,
    });

    console.log('✅ 取消订阅成功');

    await client.close();
  });
});

test.describe('MCP 资源权限测试 @integration @mcp @security', () => {
  test('应正确处理无权限访问的资源', async () => {
    test.skip(
      !process.env.MCP_SERVER_PATH || !process.env.MCP_TEST_RESTRICTED_RESOURCE,
      '需要配置 MCP_SERVER_PATH 和受限资源 URI'
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
          resources: {},
        },
      }
    );

    await client.connect(transport);

    try {
      const restrictedUri = process.env.MCP_TEST_RESTRICTED_RESOURCE!;
      await client.readResource({
        uri: restrictedUri,
      });

      // 如果没有抛出错误，测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      console.log('✅ 正确捕获了权限错误:', error.message);
      expect(error).toBeDefined();
      expect(error.message.toLowerCase()).toMatch(/permission|access|forbidden|unauthorized/);
    }

    await client.close();
  });
});
