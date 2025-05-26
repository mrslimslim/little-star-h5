#!/usr/bin/env node

/**
 * 小星星学习记录应用 - 测试运行器
 * 统一运行所有测试套件
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置
const config = {
    serverUrl: 'http://localhost:3000',
    timeout: 30000, // 30秒超时
    retries: 3
};

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查服务器是否运行
async function checkServer() {
    try {
        const response = await fetch(config.serverUrl);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 运行单个测试文件
function runTestFile(testFile, timeout = config.timeout) {
    return new Promise((resolve, reject) => {
        const testPath = path.resolve(testFile);

        if (!fs.existsSync(testPath)) {
            reject(new Error(`测试文件不存在: ${testPath}`));
            return;
        }

        colorLog('blue', `\n🚀 运行测试: ${path.basename(testFile)}`);

        const child = spawn('node', [testPath], {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        const timer = setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error(`测试超时: ${testFile}`));
        }, timeout);

        child.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
                colorLog('green', `✅ 测试通过: ${path.basename(testFile)}`);
                resolve();
            } else {
                reject(new Error(`测试失败: ${testFile} (退出码: ${code})`));
            }
        });

        child.on('error', (error) => {
            clearTimeout(timer);
            reject(new Error(`运行测试失败: ${testFile} - ${error.message}`));
        });
    });
}

// 运行所有测试
async function runAllTests() {
    colorLog('bright', '🌟 小星星学习记录应用 - 测试套件');
    colorLog('cyan', '==========================================\n');

    // 检查服务器状态
    colorLog('yellow', '🔍 检查服务器状态...');
    const serverRunning = await checkServer();

    if (!serverRunning) {
        colorLog('red', '❌ 服务器未运行！');
        colorLog('yellow', '请先启动开发服务器：npm run dev 或 pnpm dev');
        process.exit(1);
    }

    colorLog('green', '✅ 服务器运行正常\n');

    // 定义测试文件
    const testFiles = [
        'tests/api.test.js',
        'tests/frontend.test.js'
    ];

    const results = {
        passed: 0,
        failed: 0,
        total: testFiles.length,
        failedTests: []
    };

    // 运行每个测试文件
    for (const testFile of testFiles) {
        try {
            await runTestFile(testFile);
            results.passed++;
        } catch (error) {
            colorLog('red', `❌ ${error.message}`);
            results.failed++;
            results.failedTests.push({
                file: testFile,
                error: error.message
            });
        }
    }

    // 输出结果汇总
    colorLog('cyan', '\n==========================================');
    colorLog('bright', '📊 测试结果汇总');
    colorLog('cyan', '==========================================');

    colorLog('green', `✅ 通过: ${results.passed}/${results.total}`);
    if (results.failed > 0) {
        colorLog('red', `❌ 失败: ${results.failed}/${results.total}`);

        colorLog('yellow', '\n失败的测试:');
        results.failedTests.forEach(test => {
            colorLog('red', `  - ${path.basename(test.file)}: ${test.error}`);
        });
    }

    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    colorLog('cyan', `📈 成功率: ${successRate}%`);

    if (results.failed === 0) {
        colorLog('green', '\n🎉 所有测试通过！');
        return true;
    } else {
        colorLog('red', '\n💥 部分测试失败！');
        return false;
    }
}

// 运行特定测试
async function runSpecificTest(testName) {
    const testMap = {
        'api': 'tests/api.test.js',
        'frontend': 'tests/frontend.test.js',
        'all': null // 运行所有测试
    };

    if (testName === 'all') {
        return runAllTests();
    }

    const testFile = testMap[testName];
    if (!testFile) {
        colorLog('red', `❌ 未知的测试类型: ${testName}`);
        colorLog('yellow', '可用的测试类型: api, frontend, all');
        process.exit(1);
    }

    colorLog('blue', `🎯 运行指定测试: ${testName}`);

    // 检查服务器
    const serverRunning = await checkServer();
    if (!serverRunning) {
        colorLog('red', '❌ 服务器未运行！请先启动开发服务器');
        process.exit(1);
    }

    try {
        await runTestFile(testFile);
        colorLog('green', '\n🎉 测试完成！');
    } catch (error) {
        colorLog('red', `\n💥 测试失败: ${error.message}`);
        process.exit(1);
    }
}

// 生成测试报告
function generateTestReport() {
    const reportPath = path.join(process.cwd(), 'test-report.md');
    const timestamp = new Date().toISOString();

    const reportContent = `
# 测试报告

**生成时间**: ${timestamp}

## 测试概况

- **API测试**: 包含所有API端点的功能测试
- **前端测试**: 包含页面加载、用户场景测试
- **性能测试**: 测试响应时间和加载性能
- **错误处理测试**: 验证错误情况的处理

## 测试覆盖范围

### API测试
- ✅ 任务管理 API (CRUD)
- ✅ 每日记录 API (CRUD)
- ✅ 奖励管理 API (CRUD)
- ✅ 儿童状态 API (读取/更新)
- ✅ 统计数据 API (各种统计)
- ✅ 边界条件和错误处理

### 前端测试
- ✅ 页面加载测试
- ✅ 用户场景测试
- ✅ 表单提交测试
- ✅ 错误处理测试
- ✅ 性能测试

### 已知问题
- ⚠️ 数据库字段名不匹配问题 (completed_tasks表)
- ⚠️ 需要运行数据库迁移脚本

## 使用方法

\`\`\`bash
# 运行所有测试
node scripts/run-tests.js

# 运行特定测试
node scripts/run-tests.js api
node scripts/run-tests.js frontend

# 或使用npm脚本
npm run test
npm run test:api
npm run test:frontend
\`\`\`

## 建议

1. 在每次部署前运行完整测试套件
2. 定期检查测试覆盖率
3. 添加更多边界条件测试
4. 集成CI/CD流水线自动运行测试
`;

    fs.writeFileSync(reportPath, reportContent.trim());
    colorLog('green', `📋 测试报告已生成: ${reportPath}`);
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    try {
        switch (command) {
            case 'report':
                generateTestReport();
                break;
            case 'help':
                showHelp();
                break;
            default:
                const success = await runSpecificTest(command);
                process.exit(success ? 0 : 1);
        }
    } catch (error) {
        colorLog('red', `💥 运行失败: ${error.message}`);
        process.exit(1);
    }
}

function showHelp() {
    colorLog('cyan', '🌟 小星星学习记录应用 - 测试工具');
    console.log(`
用法:
  node scripts/run-tests.js [command]

命令:
  all         运行所有测试 (默认)
  api         只运行API测试
  frontend    只运行前端测试
  report      生成测试报告
  help        显示帮助信息

示例:
  node scripts/run-tests.js
  node scripts/run-tests.js api
  node scripts/run-tests.js frontend
  node scripts/run-tests.js report
`);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 