# 🚀 小星星学习记录 - 快速启动指南

## 📋 5分钟完成部署

### 第一步：安装依赖 (1分钟)
```bash
npm install
```

### 第二步：配置环境变量 (2分钟)
```bash
npm run setup
```
按照提示输入您的 Supabase 项目信息：
- Project URL (格式: `https://xxx.supabase.co`)
- API Key (anon, public)

**如何获取这些信息？**
1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目或选择现有项目
3. 进入 `Settings` > `API`
4. 复制 `Project URL` 和 `Project API Key (anon, public)`

### 第三步：初始化数据库 (1分钟)
1. 在 Supabase 控制台中，点击 `SQL Editor`
2. 点击 `New Query`
3. 复制 `scripts/init-database.sql` 文件的全部内容
4. 粘贴到编辑器中并点击 `Run`

### 第四步：启动应用 (1分钟)
```bash
npm run dev
```

🎉 **恭喜！** 访问 `http://localhost:3000` 开始使用应用！

---

## 🔧 故障排除

### 问题1：日历显示空白
**原因：** 环境变量未配置或数据库未初始化
**解决：** 
1. 检查 `.env` 文件是否存在且正确
2. 确认数据库脚本已成功执行

### 问题2：无法连接数据库
**原因：** Supabase 项目信息错误
**解决：**
1. 重新运行 `npm run setup`
2. 验证 URL 和 Key 是否正确

### 问题3：页面报错
**原因：** 数据库表未创建
**解决：**
1. 在 Supabase SQL Editor 中执行 `scripts/init-database.sql`
2. 确认6个表已成功创建

---

## 📊 验证部署

部署成功后，您应该能看到：
- ✅ 学习日历正常显示
- ✅ 可以点击日期记录学习
- ✅ 星星显示组件工作正常
- ✅ 奖励中心可以访问
- ✅ 任务管理功能正常

---

## 🎯 下一步

1. **个性化配置**
   - 在任务管理中添加适合的学习任务
   - 在奖励中心添加孩子喜欢的奖励

2. **开始使用**
   - 每日记录学习成果
   - 积累星星兑换奖励

3. **探索功能**
   - 查看学习统计
   - 设置个性化任务

---

## 📞 获取帮助

- 📖 完整文档：`database-setup.md`
- 🔧 环境配置：`env-setup.md`
- 🏗️ 项目说明：`README.md`

**遇到问题？**
1. 检查控制台错误信息
2. 验证 Supabase 连接状态
3. 重新执行初始化步骤

开始您的小星星学习之旅吧！ 🌟 