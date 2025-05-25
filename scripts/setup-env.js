#!/usr/bin/env node

/**
 * 小星星学习记录应用 - 环境变量配置助手
 * 运行方式: node scripts/setup-env.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🌟 小星星学习记录应用 - 环境变量配置助手');
console.log('='.repeat(50));
console.log();

async function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function validateUrl(url) {
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.supabase\.co$/;
    return urlPattern.test(url);
}

async function validateKey(key) {
    // Supabase anon key 通常以 'eyJ' 开头 (JWT token)
    return key && key.length > 50 && key.startsWith('eyJ');
}

async function setupEnvironment() {
    try {
        console.log('📋 请按照以下步骤配置您的 Supabase 环境变量：');
        console.log();
        console.log('1. 访问 https://supabase.com');
        console.log('2. 登录并创建新项目（如果还没有的话）');
        console.log('3. 进入项目控制台');
        console.log('4. 点击 Settings > API');
        console.log('5. 复制以下信息：');
        console.log();

        // 获取 Supabase URL
        let supabaseUrl;
        while (true) {
            supabaseUrl = await askQuestion('请输入您的 Supabase Project URL（格式: https://xxx.supabase.co）: ');

            if (await validateUrl(supabaseUrl)) {
                break;
            } else {
                console.log('❌ URL 格式不正确，请重新输入');
            }
        }

        // 获取 Supabase Anon Key
        let supabaseKey;
        while (true) {
            supabaseKey = await askQuestion('请输入您的 Supabase Project API Key (anon, public): ');

            if (await validateKey(supabaseKey)) {
                break;
            } else {
                console.log('❌ API Key 格式不正确，请重新输入');
            }
        }

        // 生成 .env 文件内容
        const envContent = `# Supabase Configuration
# 小星星学习记录应用配置文件
# 请不要将此文件提交到版本控制系统

SUPABASE_URL=${supabaseUrl}
SUPABASE_KEY=${supabaseKey}

# 配置时间: ${new Date().toLocaleString()}
`;

        // 写入 .env 文件
        const envPath = path.join(process.cwd(), '.env');

        // 检查是否已存在 .env 文件
        if (fs.existsSync(envPath)) {
            const overwrite = await askQuestion('⚠️  .env 文件已存在，是否覆盖？(y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ 配置已取消');
                rl.close();
                return;
            }
        }

        fs.writeFileSync(envPath, envContent);

        console.log();
        console.log('✅ 环境变量配置完成！');
        console.log('📁 .env 文件已创建');
        console.log();
        console.log('🔮 下一步：');
        console.log('1. 在 Supabase SQL Editor 中执行 scripts/init-database.sql');
        console.log('2. 运行 npm run dev 启动应用');
        console.log();
        console.log('🎯 配置验证：');
        console.log(`   URL: ${supabaseUrl}`);
        console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

    } catch (error) {
        console.error('❌ 配置过程中出现错误:', error.message);
    } finally {
        rl.close();
    }
}

// 检查是否在正确的目录中运行
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.error('❌ 请在项目根目录中运行此脚本');
    process.exit(1);
}

// 开始配置
setupEnvironment().catch(console.error); 