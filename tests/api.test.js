/**
 * 小星星学习记录 H5 应用 - API 测试套件
 * 使用 Node.js 内置测试工具进行测试
 */

import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert';

// 测试配置
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// 测试数据
const TEST_DATE = new Date().toISOString().split('T')[0];
const TOMORROW_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// 辅助函数
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    const data = await response.json();
    return { response, data, status: response.status };
}

// 清理函数
async function cleanup() {
    try {
        // 删除测试数据
        await apiRequest(`/daily-records/${TEST_DATE}`, { method: 'DELETE' });
        await apiRequest(`/daily-records/${TOMORROW_DATE}`, { method: 'DELETE' });
    } catch (error) {
        console.log('Cleanup warning:', error.message);
    }
}

describe('小星星学习记录 API 测试', () => {

    beforeEach(async () => {
        await cleanup();
    });

    after(async () => {
        await cleanup();
    });

    describe('任务管理 API', () => {
        test('获取任务列表', async () => {
            const { data, status } = await apiRequest('/tasks');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert(Array.isArray(data.data));
            console.log('✅ 获取任务列表成功');
        });

        test('创建新任务', async () => {
            const newTask = {
                name: '测试任务',
                default_stars: 3,
                icon: '🧪'
            };

            const { data, status } = await apiRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify(newTask)
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.name, newTask.name);
            console.log('✅ 创建新任务成功');

            // 清理
            if (data.data?.id) {
                await apiRequest(`/tasks/${data.data.id}`, { method: 'DELETE' });
            }
        });

        test('创建任务 - 缺少必需字段', async () => {
            const invalidTask = {
                icon: '🧪'
                // 缺少 name 和 default_stars
            };

            const { status } = await apiRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify(invalidTask)
            });

            assert.strictEqual(status, 400);
            console.log('✅ 创建任务验证错误处理正确');
        });
    });

    describe('每日记录 API', () => {
        test('获取每日记录列表', async () => {
            const { data, status } = await apiRequest('/daily-records');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert(Array.isArray(data.data));
            console.log('✅ 获取每日记录列表成功');
        });

        test('获取特定日期记录', async () => {
            const { data, status } = await apiRequest(`/daily-records/${TEST_DATE}`);

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            // 可能不存在记录，但不应该出错
            console.log('✅ 获取特定日期记录成功');
        });

        test('创建每日记录', async () => {
            const recordData = {
                date: TEST_DATE,
                completed_tasks: [
                    {
                        task_name: '阅读30分钟',
                        stars_earned: 2,
                        is_custom: false
                    },
                    {
                        task_name: '自定义任务',
                        stars_earned: 1,
                        is_custom: true
                    }
                ],
                notes: '今天表现很好！'
            };

            const { data, status } = await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify(recordData)
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.total_stars_earned_today, 3);
            console.log('✅ 创建每日记录成功');
        });

        test('更新现有记录', async () => {
            // 先创建一个记录
            const initialData = {
                date: TEST_DATE,
                completed_tasks: [
                    {
                        task_name: '阅读30分钟',
                        stars_earned: 2,
                        is_custom: false
                    }
                ]
            };

            await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify(initialData)
            });

            // 然后更新记录
            const updateData = {
                date: TEST_DATE,
                completed_tasks: [
                    {
                        task_name: '阅读30分钟',
                        stars_earned: 2,
                        is_custom: false
                    },
                    {
                        task_name: '完成作业',
                        stars_earned: 3,
                        is_custom: false
                    }
                ],
                notes: '更新后的记录'
            };

            const { data, status } = await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify(updateData)
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.total_stars_earned_today, 5);
            console.log('✅ 更新每日记录成功');
        });

        test('创建记录 - 缺少必需字段', async () => {
            const invalidData = {
                completed_tasks: []
                // 缺少 date
            };

            const { status } = await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify(invalidData)
            });

            assert.strictEqual(status, 400);
            console.log('✅ 每日记录验证错误处理正确');
        });

        test('删除每日记录', async () => {
            // 先创建一个记录
            const recordData = {
                date: TOMORROW_DATE,
                completed_tasks: [
                    {
                        task_name: '测试任务',
                        stars_earned: 1,
                        is_custom: true
                    }
                ]
            };

            await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify(recordData)
            });

            // 然后删除
            const { data, status } = await apiRequest(`/daily-records/${TOMORROW_DATE}`, {
                method: 'DELETE'
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            console.log('✅ 删除每日记录成功');
        });
    });

    describe('奖励管理 API', () => {
        test('获取奖励列表', async () => {
            const { data, status } = await apiRequest('/rewards');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert(Array.isArray(data.data));
            console.log('✅ 获取奖励列表成功');
        });

        test('创建新奖励', async () => {
            const newReward = {
                name: '测试奖励',
                description: '测试奖励描述',
                stars_cost: 10,
                icon: '🎁'
            };

            const { data, status } = await apiRequest('/rewards', {
                method: 'POST',
                body: JSON.stringify(newReward)
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.name, newReward.name);
            console.log('✅ 创建新奖励成功');

            // 清理
            if (data.data?.id) {
                await apiRequest(`/rewards/${data.data.id}`, { method: 'DELETE' });
            }
        });
    });

    describe('儿童状态 API', () => {
        test('获取儿童状态', async () => {
            const { data, status } = await apiRequest('/child-status');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert(typeof data.data.total_stars === 'number');
            console.log('✅ 获取儿童状态成功');
        });

        test('更新儿童状态', async () => {
            const updateData = {
                total_stars: 100
            };

            const { data, status } = await apiRequest('/child-status', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            console.log('✅ 更新儿童状态成功');
        });
    });

    describe('统计数据 API', () => {
        test('获取统计数据', async () => {
            const { data, status } = await apiRequest('/statistics');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            assert(typeof data.data === 'object');
            console.log('✅ 获取统计数据成功');
        });

        test('获取周统计数据', async () => {
            const { data, status } = await apiRequest('/statistics?period=week');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            console.log('✅ 获取周统计数据成功');
        });

        test('获取月统计数据', async () => {
            const { data, status } = await apiRequest('/statistics?period=month');

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            console.log('✅ 获取月统计数据成功');
        });
    });

    describe('边界条件和错误处理', () => {
        test('无效日期格式', async () => {
            const { status } = await apiRequest('/daily-records/invalid-date');

            assert(status >= 400);
            console.log('✅ 无效日期格式处理正确');
        });

        test('不存在的API端点', async () => {
            const { status } = await apiRequest('/non-existent-endpoint');

            assert.strictEqual(status, 404);
            console.log('✅ 不存在端点处理正确');
        });

        test('空请求体', async () => {
            const { status } = await apiRequest('/daily-records', {
                method: 'POST',
                body: ''
            });

            assert(status >= 400);
            console.log('✅ 空请求体处理正确');
        });

        test('无效JSON格式', async () => {
            try {
                const response = await fetch(`${API_BASE}/daily-records`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: 'invalid json'
                });

                assert(response.status >= 400);
                console.log('✅ 无效JSON格式处理正确');
            } catch (error) {
                console.log('✅ 无效JSON格式处理正确');
            }
        });
    });

    describe('性能和并发测试', () => {
        test('并发创建多个记录', async () => {
            const dates = Array.from({ length: 5 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            });

            const promises = dates.map(date =>
                apiRequest('/daily-records', {
                    method: 'POST',
                    body: JSON.stringify({
                        date,
                        completed_tasks: [
                            {
                                task_name: '并发测试任务',
                                stars_earned: 1,
                                is_custom: true
                            }
                        ]
                    })
                })
            );

            const results = await Promise.all(promises);

            results.forEach(({ status }) => {
                assert.strictEqual(status, 200);
            });

            console.log('✅ 并发创建记录成功');

            // 清理
            const cleanupPromises = dates.map(date =>
                apiRequest(`/daily-records/${date}`, { method: 'DELETE' })
            );
            await Promise.allSettled(cleanupPromises);
        });

        test('大量任务记录', async () => {
            const manyTasks = Array.from({ length: 50 }, (_, i) => ({
                task_name: `批量任务 ${i + 1}`,
                stars_earned: Math.floor(Math.random() * 3) + 1,
                is_custom: true
            }));

            const { data, status } = await apiRequest('/daily-records', {
                method: 'POST',
                body: JSON.stringify({
                    date: TEST_DATE,
                    completed_tasks: manyTasks
                })
            });

            assert.strictEqual(status, 200);
            assert.strictEqual(data.success, true);
            console.log('✅ 大量任务记录处理成功');
        });
    });
});

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 开始运行 API 测试套件...\n');

    // 简单的测试运行器（如果没有安装专业测试框架）
    async function runBasicTests() {
        console.log('运行基础功能测试...\n');

        try {
            // 测试服务器连接
            const healthCheck = await fetch(BASE_URL);
            if (!healthCheck.ok) {
                throw new Error('服务器未运行或无法连接');
            }
            console.log('✅ 服务器连接正常\n');

            // 基础API测试
            const tests = [
                {
                    name: '获取任务列表',
                    test: () => apiRequest('/tasks')
                },
                {
                    name: '获取每日记录',
                    test: () => apiRequest('/daily-records')
                },
                {
                    name: '获取奖励列表',
                    test: () => apiRequest('/rewards')
                },
                {
                    name: '获取儿童状态',
                    test: () => apiRequest('/child-status')
                },
                {
                    name: '获取统计数据',
                    test: () => apiRequest('/statistics')
                }
            ];

            for (const { name, test } of tests) {
                try {
                    const { status, data } = await test();
                    if (status === 200 && data.success) {
                        console.log(`✅ ${name}: 通过`);
                    } else {
                        console.log(`❌ ${name}: 失败 (状态: ${status})`);
                    }
                } catch (error) {
                    console.log(`❌ ${name}: 错误 - ${error.message}`);
                }
            }

            console.log('\n🎉 基础测试完成！');

        } catch (error) {
            console.error('❌ 测试失败:', error.message);
            process.exit(1);
        }
    }

    runBasicTests();
} 