#!/usr/bin/env node

/**
 * 小星星学习记录应用 - 数据库初始化脚本
 * 运行方式: node scripts/init-db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 简单的环境变量读取（避免依赖 dotenv）
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    return env;
}

const env = loadEnv();

console.log('🌟 小星星学习记录应用 - 数据库初始化脚本');
console.log('='.repeat(50));
console.log();

// 检查环境变量
if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    console.error('❌ 错误: 未找到 Supabase 环境变量');
    console.log('请确保 .env 文件存在并包含以下内容:');
    console.log('SUPABASE_URL=你的项目URL');
    console.log('SUPABASE_KEY=你的API密钥');
    console.log();
    console.log('如果还没有配置，请运行: npm run setup');
    process.exit(1);
}

// 读取 SQL 脚本
const sqlPath = path.join(__dirname, 'init-database.sql');
if (!fs.existsSync(sqlPath)) {
    console.error('❌ 错误: 未找到 init-database.sql 文件');
    process.exit(1);
}

const sqlScript = fs.readFileSync(sqlPath, 'utf8');



async function verifyInitialization(supabase) {
    try {
        console.log('🔍 验证数据库初始化结果...');

        // 检查表是否创建成功
        const tables = ['tasks', 'daily_records', 'completed_tasks', 'rewards', 'child_status', 'redeemed_rewards'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ 表 ${table} 验证失败:`, error.message);
                } else {
                    console.log(`✅ 表 ${table} 创建成功`);
                }
            } catch (err) {
                console.log(`❌ 表 ${table} 验证出错:`, err.message);
            }
        }

        // 检查初始数据
        try {
            const { data: tasks } = await supabase.from('tasks').select('*');
            const { data: rewards } = await supabase.from('rewards').select('*');
            const { data: status } = await supabase.from('child_status').select('*');

            console.log();
            console.log('📊 初始数据统计:');
            console.log(`   📚 任务数量: ${tasks?.length || 0}`);
            console.log(`   🎁 奖励数量: ${rewards?.length || 0}`);
            console.log(`   ⭐ 当前星星数: ${status?.[0]?.total_stars || 0}`);

        } catch (err) {
            console.log('⚠️  无法验证初始数据:', err.message);
        }

        console.log();
        console.log('🎯 下一步:');
        console.log('   运行 npm run dev 启动应用');
        console.log('   访问 http://localhost:3000 开始使用');

    } catch (error) {
        console.log('⚠️  验证过程出错:', error.message);
    }
}

// 由于 Supabase 客户端限制，我们提供手动执行的指导
async function provideManualInstructions() {
    console.log('🔧 由于安全限制，请按以下步骤手动初始化数据库:');
    console.log();
    console.log('1. 访问 Supabase 控制台: https://app.supabase.com/');
    console.log('2. 选择您的项目');
    console.log('3. 点击左侧菜单 "SQL Editor"');
    console.log('4. 点击 "New Query"');
    console.log('5. 复制 scripts/init-database.sql 文件的全部内容');
    console.log('6. 粘贴到编辑器中');
    console.log('7. 点击 "Run" 执行脚本');
    console.log();
    console.log('📁 SQL 脚本内容:');
    console.log('-'.repeat(50));
    console.log(sqlScript.substring(0, 500) + '...');
    console.log('-'.repeat(50));
    console.log();
    console.log('✅ 执行完成后，运行 npm run dev 启动应用');
}

// 主要逻辑：提供指导并验证
async function main() {
    try {
        // 提供手动执行指导
        await provideManualInstructions();

        // 尝试验证数据库（如果可能）
        console.log();
        console.log('🔍 检查数据库连接状态...');

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

        // 简单的连接测试
        const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });

        if (error) {
            console.log('⚠️  数据库尚未初始化，请按上述步骤手动执行 SQL 脚本');
        } else {
            console.log('✅ 数据库连接正常！');
            await verifyInitialization(supabase);
        }

    } catch (error) {
        console.log('🔧 请按上述步骤手动初始化数据库');
    }
}

main().catch(console.error); 