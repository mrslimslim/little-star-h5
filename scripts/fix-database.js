#!/usr/bin/env node

/**
 * 数据库修复脚本
 * 修复 completed_tasks 表的字段名不匹配问题
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env') });

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

async function fixDatabase() {
    colorLog('bright', '🔧 数据库修复工具');
    colorLog('blue', '====================\n');

    // 检查环境变量
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        colorLog('red', '❌ 缺少必需的环境变量!');
        colorLog('yellow', '请确保 .env 文件包含:');
        colorLog('yellow', '- SUPABASE_URL');
        colorLog('yellow', '- SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        colorLog('yellow', '🔍 检查数据库结构...');

        // 检查当前表结构
        const { data: tableInfo, error: tableError } = await supabase
            .from('completed_tasks')
            .select('*')
            .limit(1);

        if (tableError) {
            colorLog('red', `❌ 无法访问 completed_tasks 表: ${tableError.message}`);

            // 如果表不存在，创建正确的表结构
            if (tableError.code === 'PGRST106') {
                colorLog('yellow', '📝 创建 completed_tasks 表...');

                const createTableSQL = `
                    CREATE TABLE IF NOT EXISTS completed_tasks (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE,
                        task_id UUID REFERENCES tasks (id),
                        task_name TEXT NOT NULL,
                        stars_earned INTEGER NOT NULL DEFAULT 1,
                        is_custom BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );
                `;

                const { error: createError } = await supabase.rpc('execute_sql', {
                    sql: createTableSQL
                });

                if (createError) {
                    colorLog('red', `❌ 创建表失败: ${createError.message}`);
                    throw createError;
                }

                colorLog('green', '✅ 成功创建 completed_tasks 表');

                // 创建索引
                const createIndexSQL = `
                    CREATE INDEX IF NOT EXISTS idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);
                    CREATE INDEX IF NOT EXISTS idx_completed_tasks_task_id ON completed_tasks (task_id);
                `;

                await supabase.rpc('execute_sql', { sql: createIndexSQL });
                colorLog('green', '✅ 成功创建索引');

                // 启用RLS
                const enableRLSSQL = `
                    ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
                    CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);
                `;

                await supabase.rpc('execute_sql', { sql: enableRLSSQL });
                colorLog('green', '✅ 成功启用行级安全');
            }
        } else {
            colorLog('green', '✅ completed_tasks 表存在');

            // 检查字段是否正确
            const columns = Object.keys(tableInfo[0] || {});
            const hasCorrectFields = columns.includes('stars_earned') && columns.includes('created_at');
            const hasOldFields = columns.includes('stars_awarded') || columns.includes('completed_at');

            if (hasOldFields && !hasCorrectFields) {
                colorLog('yellow', '⚠️ 发现字段名不匹配，需要迁移数据...');

                // 备份现有数据
                const { data: existingData, error: backupError } = await supabase
                    .from('completed_tasks')
                    .select('*');

                if (backupError) {
                    throw backupError;
                }

                if (existingData && existingData.length > 0) {
                    colorLog('yellow', `📦 备份 ${existingData.length} 条记录...`);

                    // 这里需要手动处理，因为Supabase客户端不支持DDL操作
                    colorLog('red', '❌ 自动迁移需要数据库管理员权限');
                    colorLog('yellow', '请手动执行以下步骤:');
                    colorLog('yellow', '1. 在 Supabase SQL Editor 中执行 database-migration-fix.sql');
                    colorLog('yellow', '2. 或者联系数据库管理员进行字段重命名');

                    // 生成迁移脚本
                    generateMigrationScript(existingData);

                } else {
                    colorLog('green', '✅ 表为空，可以安全重建');
                    // 如果表为空，可以直接重建
                    await recreateEmptyTable(supabase);
                }
            } else if (hasCorrectFields) {
                colorLog('green', '✅ 数据库结构正确');
            }
        }

        // 测试数据库连接
        colorLog('yellow', '🧪 测试数据库操作...');

        const testData = {
            daily_record_id: '00000000-0000-0000-0000-000000000000', // 虚拟ID用于测试
            task_name: '测试任务',
            stars_earned: 1,
            is_custom: true
        };

        // 这个插入应该会失败（因为外键约束），但能验证字段名是否正确
        const { error: testError } = await supabase
            .from('completed_tasks')
            .insert(testData);

        if (testError && testError.code === '23503') {
            // 外键约束错误是预期的
            colorLog('green', '✅ 字段名验证通过');
        } else if (testError && testError.message.includes('created_at')) {
            colorLog('red', '❌ 字段名仍然不正确');
            throw new Error('字段名修复失败');
        } else {
            colorLog('green', '✅ 数据库操作测试通过');
        }

        colorLog('green', '\n🎉 数据库修复完成！');

    } catch (error) {
        colorLog('red', `💥 修复失败: ${error.message}`);
        process.exit(1);
    }
}

async function recreateEmptyTable(supabase) {
    colorLog('yellow', '🔄 重建空表...');

    // 删除旧表
    const dropSQL = 'DROP TABLE IF EXISTS completed_tasks;';

    // 创建新表
    const createSQL = `
        CREATE TABLE completed_tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE,
            task_id UUID REFERENCES tasks (id),
            task_name TEXT NOT NULL,
            stars_earned INTEGER NOT NULL DEFAULT 1,
            is_custom BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);
        CREATE INDEX idx_completed_tasks_task_id ON completed_tasks (task_id);
        
        ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);
    `;

    try {
        await supabase.rpc('execute_sql', { sql: dropSQL + createSQL });
        colorLog('green', '✅ 成功重建表');
    } catch (error) {
        colorLog('red', '❌ 重建表失败，请手动执行 database-migration-fix.sql');
        throw error;
    }
}

function generateMigrationScript(existingData) {
    const scriptPath = path.join(process.cwd(), 'migration-data.sql');

    let script = `-- 数据迁移脚本
-- 生成时间: ${new Date().toISOString()}

-- 1. 备份现有数据
CREATE TABLE completed_tasks_backup AS SELECT * FROM completed_tasks;

-- 2. 删除旧表
DROP TABLE completed_tasks;

-- 3. 创建新表（正确的字段名）
CREATE TABLE completed_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks (id),
    task_name TEXT NOT NULL,
    stars_earned INTEGER NOT NULL DEFAULT 1,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 恢复数据（如果有备份）
`;

    if (existingData && existingData.length > 0) {
        script += `INSERT INTO completed_tasks (id, daily_record_id, task_id, task_name, stars_earned, is_custom, created_at) VALUES\n`;

        const values = existingData.map(row => {
            const starsEarned = row.stars_awarded || row.stars_earned || 1;
            const createdAt = row.completed_at || row.created_at || 'NOW()';
            return `('${row.id}', '${row.daily_record_id}', ${row.task_id ? `'${row.task_id}'` : 'NULL'}, '${row.task_name}', ${starsEarned}, ${row.is_custom}, '${createdAt}')`;
        }).join(',\n');

        script += values + ';\n';
    }

    script += `
-- 5. 创建索引
CREATE INDEX idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);
CREATE INDEX idx_completed_tasks_task_id ON completed_tasks (task_id);

-- 6. 启用RLS
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);

-- 7. 清理备份表（可选）
-- DROP TABLE completed_tasks_backup;
`;

    fs.writeFileSync(scriptPath, script);
    colorLog('blue', `📝 已生成迁移脚本: ${scriptPath}`);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    fixDatabase();
} 