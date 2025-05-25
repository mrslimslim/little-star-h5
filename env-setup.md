# 环境变量配置说明

请在项目根目录创建 `.env` 文件，内容如下：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_anon_key_here
```

## 如何获取这些值：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目（或创建新项目）
3. 进入 `Settings` -> `API`
4. 复制以下值：
   - **Project URL** -> `SUPABASE_URL`
   - **Project API keys** 中的 `anon public` 密钥 -> `SUPABASE_KEY`

## 完整步骤：

1. 复制项目根目录的 `.env` 文件
2. 替换占位符为实际值
3. 保存文件
4. 重新启动开发服务器 `npm run dev`

## 注意事项：

- `.env` 文件已被 `.gitignore` 忽略，不会提交到版本控制
- 确保 SUPABASE_URL 以 `https://` 开头
- SUPABASE_KEY 是一个很长的 JWT token
- 不要分享你的真实 API 密钥 