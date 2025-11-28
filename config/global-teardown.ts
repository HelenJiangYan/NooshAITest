import { FullConfig } from '@playwright/test';

/**
 * 全局清理 - 在所有测试之后运行
 * 用于清理测试数据、生成报告等
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 开始全局清理...');

  try {
    console.log('\n📊 测试执行摘要:');
    console.log(`   测试配置: ${config.configFile}`);
    console.log(`   Worker数: ${config.workers}`);
    console.log(`   重试次数: ${config.projects[0]?.retries ?? 'undefined'}`);

  } catch (error) {
    console.error('❌ 全局清理失败:', error);
  }

  console.log('✅ 全局清理完成\n');
}

export default globalTeardown;
