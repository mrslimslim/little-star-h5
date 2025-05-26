/**
 * 快速测试当前问题的脚本
 * 专门测试数据库字段问题和API保存功能
 */

const BASE_URL = 'http://localhost:3000';

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCurrentIssue() {
    colorLog('bright', '🧪 测试当前问题: 保存任务失败');
    colorLog('blue', '=====================================\n');

    try {
        // 1. 测试服务器连接
        colorLog('yellow', '🔍 检查服务器连接...');
        const healthCheck = await fetch(BASE_URL);
        if (!healthCheck.ok) {
            throw new Error('服务器未运行');
        }
        colorLog('green', '✅ 服务器连接正常\n');

        // 2. 测试获取任务列表
        colorLog('yellow', '📋 测试获取任务列表...');
        const tasksResponse = await fetch(`${BASE_URL}/api/tasks`);
        const tasksData = await tasksResponse.json();

        if (tasksResponse.ok && tasksData.success) {
            colorLog('green', `✅ 获取任务列表成功，共 ${tasksData.data.length} 个任务\n`);
        } else {
            colorLog('red', `❌ 获取任务列表失败: ${tasksData.message || '未知错误'}\n`);
        }

        // 3. 测试保存每日记录（重现错误）
        colorLog('yellow', '💾 测试保存每日记录...');
        const today = new Date().toISOString().split('T')[0];

        const testRecord = {
            date: today,
            completed_tasks: [
                {
                    task_name: '测试任务1',
                    stars_earned: 2,
                    is_custom: false
                },
                {
                    task_name: '测试任务2',
                    stars_earned: 1,
                    is_custom: true
                }
            ],
            notes: '测试保存功能'
        };

        const saveResponse = await fetch(`${BASE_URL}/api/daily-records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testRecord)
        });

        const saveData = await saveResponse.json();

        if (saveResponse.ok && saveData.success) {
            colorLog('green', '✅ 保存每日记录成功！');
            colorLog('green', `   总星星数: ${saveData.data.total_stars_earned_today}`);
            colorLog('green', '   问题已经修复！\n');

            // 清理测试数据
            await fetch(`${BASE_URL}/api/daily-records/${today}`, {
                method: 'DELETE'
            });
            colorLog('blue', '🧹 已清理测试数据');

        } else {
            colorLog('red', '❌ 保存每日记录失败！');
            colorLog('red', `   状态码: ${saveResponse.status}`);
            colorLog('red', `   错误信息: ${saveData.message || '未知错误'}`);

            if (saveData.data) {
                colorLog('yellow', '   详细错误:');
                console.log('  ', JSON.stringify(saveData.data, null, 2));
            }

            // 检查是否是字段名问题
            if (saveData.data?.message?.includes('created_at') ||
                saveData.data?.message?.includes('stars_earned')) {
                colorLog('yellow', '\n💡 这是数据库字段名不匹配问题!');
                colorLog('yellow', '   解决方案:');
                colorLog('yellow', '   1. 运行: node scripts/fix-database.js');
                colorLog('yellow', '   2. 或在 Supabase SQL Editor 中执行 database-migration-fix.sql');
            }
        }

        // 4. 测试其他API端点
        colorLog('yellow', '\n🧪 测试其他API端点...');

        const otherTests = [
            { name: '奖励列表', endpoint: '/api/rewards' },
            { name: '儿童状态', endpoint: '/api/child-status' },
            { name: '统计数据', endpoint: '/api/statistics' }
        ];

        for (const { name, endpoint } of otherTests) {
            try {
                const response = await fetch(`${BASE_URL}${endpoint}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    colorLog('green', `✅ ${name}: 正常`);
                } else {
                    colorLog('red', `❌ ${name}: 失败`);
                }
            } catch (error) {
                colorLog('red', `❌ ${name}: 错误 - ${error.message}`);
            }
        }

        colorLog('blue', '\n📋 测试总结:');
        colorLog('blue', '==============');
        colorLog('yellow', '如果保存每日记录失败，请按照以下步骤修复:');
        colorLog('yellow', '1. 运行数据库修复脚本: node scripts/fix-database.js');
        colorLog('yellow', '2. 或手动执行数据库迁移脚本');
        colorLog('yellow', '3. 重新测试保存功能');

    } catch (error) {
        colorLog('red', `💥 测试过程中出现错误: ${error.message}`);

        if (error.message.includes('fetch')) {
            colorLog('yellow', '💡 请确保开发服务器正在运行: npm run dev');
        }
    }
}

// 运行测试
console.log('🌟 小星星学习记录应用 - 问题诊断\n');
testCurrentIssue(); 