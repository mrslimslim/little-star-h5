# 数据库初始化指南

## 📊 数据库结构概览

小星星学习记录应用使用 Supabase 作为后端数据库，包含以下6个主要表：

### 数据表说明

1. **tasks** - 任务库表
   - 存储预设的学习任务
   - 包含任务名称、默认星星数、图标等

2. **daily_records** - 每日记录表
   - 记录每天的学习情况
   - 包含日期、当日总星星数、备注等

3. **completed_tasks** - 完成任务详情表
   - 记录具体完成的任务详情
   - 关联每日记录，包含任务名称、获得星星数等

4. **rewards** - 奖励库表
   - 存储可兑换的奖励
   - 包含奖励名称、所需星星数、描述等

5. **child_status** - 儿童状态表
   - 记录孩子的总星星数
   - 单行记录，实时更新

6. **redeemed_rewards** - 奖励兑换记录表
   - 记录已兑换的奖励历史
   - 包含兑换时间、消耗星星数等

## 🚀 初始化步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase官网](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 选择组织，填写项目名称（如：little-star-learning）
5. 设置数据库密码（请记住此密码）
6. 选择地区（推荐选择离你最近的地区）
7. 点击 "Create new project"

### 2. 获取项目配置信息

项目创建完成后：
1. 进入项目控制台
2. 点击左侧菜单 "Settings" > "API"
3. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **Project API Key (anon, public)**: `eyJhbGc...`

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
SUPABASE_URL=你的项目URL
SUPABASE_KEY=你的API密钥
```

### 4. 执行数据库初始化

1. 在 Supabase 控制台中，点击左侧菜单 "SQL Editor"
2. 点击 "New Query" 创建新查询
3. 复制 `supabase-schema.sql` 文件中的所有内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行脚本

### 5. 验证初始化结果

执行完成后，您应该能看到：
- ✅ 6个数据表已创建
- ✅ 索引已创建
- ✅ RLS 策略已设置
- ✅ 8个默认学习任务已插入
- ✅ 8个默认奖励已插入
- ✅ 儿童状态记录已初始化

## 📋 默认数据

### 预设学习任务

| 任务名称 | 默认星星数 | 图标 |
|---------|-----------|------|
| 阅读30分钟 | 2 | 📚 |
| 完成作业 | 3 | ✏️ |
| 练习钢琴 | 2 | 🎹 |
| 整理房间 | 1 | 🧹 |
| 帮助家务 | 1 | 🏠 |
| 运动锻炼 | 2 | ⚽ |
| 早睡早起 | 1 | 😴 |
| 刷牙洗脸 | 1 | 🦷 |

### 预设奖励

| 奖励名称 | 所需星星 | 图标 |
|---------|----------|------|
| 看30分钟动画片 | 5 | 📺 |
| 吃一次冰淇淋 | 8 | 🍦 |
| 晚睡30分钟 | 10 | 🌙 |
| 选择今天的晚餐 | 12 | 🍽️ |
| 买一本新书 | 15 | 📖 |
| 和朋友玩游戏 | 20 | 🎮 |
| 买一个小玩具 | 25 | 🧸 |
| 去游乐园玩 | 50 | 🎠 |

## 🔧 故障排除

### 常见问题

1. **SQL执行失败**
   - 检查网络连接
   - 确保复制了完整的SQL脚本
   - 重新执行失败的部分

2. **环境变量配置错误**
   - 检查URL和Key是否正确复制
   - 确保没有多余的空格或换行

3. **应用连接数据库失败**
   - 验证环境变量配置
   - 检查Supabase项目状态
   - 重启开发服务器

### 重置数据库

如需重新初始化，可以执行以下SQL：

```sql
-- 删除所有表（谨慎操作）
DROP TABLE IF EXISTS redeemed_rewards CASCADE;
DROP TABLE IF EXISTS completed_tasks CASCADE;
DROP TABLE IF EXISTS daily_records CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS child_status CASCADE;

-- 然后重新执行 supabase-schema.sql
```

## ✅ 完成

数据库初始化完成后，您就可以：
- 🎯 启动应用：`npm run dev`
- 📅 查看学习日历
- ⭐ 记录学习成果
- 🎁 兑换奖励
- ⚙️ 管理任务和奖励

祝您使用愉快！ 🌟 