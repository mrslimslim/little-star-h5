# 小星星学习记录应用 - 测试指南

## 🎯 概述

本测试套件为小星星学习记录应用提供全面的功能测试，确保所有核心功能的可靠性。测试套件包括API测试、前端功能测试、性能测试和错误处理测试。

## 🚀 快速开始

### 1. 修复数据库问题

在运行测试之前，需要先修复数据库中的字段名不匹配问题：

```bash
# 自动检查并修复数据库
node scripts/fix-database.js

# 或手动执行迁移脚本
npm run db:migrate
```

### 2. 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

### 3. 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定类型的测试
npm run test:api      # 只运行API测试
npm run test:frontend # 只运行前端测试

# 生成测试报告
npm run test:report

# 查看帮助信息
npm run test:help
```

## 📋 测试类型

### API 测试 (`tests/api.test.js`)

测试所有后端API端点的功能：

#### 🔧 任务管理 API
- ✅ 获取任务列表
- ✅ 创建新任务  
- ✅ 更新任务
- ✅ 删除任务
- ✅ 数据验证和错误处理

#### 📝 每日记录 API
- ✅ 获取记录列表（支持分页）
- ✅ 获取特定日期记录
- ✅ 创建每日记录
- ✅ 更新现有记录
- ✅ 删除记录
- ✅ 复杂任务数据处理

#### 🎁 奖励管理 API
- ✅ 获取奖励列表
- ✅ 创建奖励
- ✅ 更新奖励
- ✅ 删除奖励

#### 👶 儿童状态 API
- ✅ 获取当前状态
- ✅ 更新星星总数

#### 📊 统计数据 API
- ✅ 基础统计
- ✅ 周统计数据
- ✅ 月统计数据
- ✅ 自定义时间范围

### 前端测试 (`tests/frontend.test.js`)

测试用户界面和交互功能：

#### 📄 页面加载测试
- ✅ 首页加载
- ✅ 任务页面
- ✅ 记录页面
- ✅ 奖励页面
- ✅ 统计页面

#### 👤 用户场景测试
- ✅ 完整的日常记录流程
- ✅ 奖励兑换流程
- ✅ 数据统计查看
- ✅ 错误处理测试

#### ⚡ 性能测试
- ✅ 页面加载性能
- ✅ API响应性能
- ✅ 并发处理能力

## 🛠 测试工具

### 主要测试脚本

```bash
scripts/run-tests.js     # 测试运行器
scripts/fix-database.js  # 数据库修复工具
```

### 测试数据管理

测试套件会自动：
- 创建测试数据
- 运行测试
- 清理测试数据
- 生成测试报告

### 环境要求

- ✅ Node.js (支持 fetch API)
- ✅ 开发服务器运行在 `http://localhost:3000`
- ✅ Supabase 数据库连接正常
- ✅ 正确的环境变量配置

## 📊 测试报告

运行 `npm run test:report` 会生成 `test-report.md` 文件，包含：

- 测试执行概况
- 覆盖范围统计
- 性能指标
- 已知问题列表
- 改进建议

## 🔧 故障排除

### 常见问题

#### 1. 数据库字段错误
```
错误: Could not find the 'created_at' column of 'completed_tasks'
解决: 运行 node scripts/fix-database.js
```

#### 2. 服务器未运行
```
错误: 服务器未运行或无法连接
解决: 启动开发服务器 npm run dev
```

#### 3. 环境变量缺失
```
错误: 缺少必需的环境变量
解决: 检查 .env 文件配置
```

#### 4. 测试超时
```
错误: 测试超时
解决: 检查网络连接和服务器性能
```

### 调试技巧

1. **查看详细错误信息**
   ```bash
   node tests/api.test.js  # 直接运行单个测试文件
   ```

2. **检查服务器日志**
   ```bash
   # 在另一个终端查看服务器输出
   npm run dev
   ```

3. **验证数据库状态**
   ```bash
   node scripts/fix-database.js
   ```

## 🎯 最佳实践

### 运行测试前
1. ✅ 确保开发服务器正在运行
2. ✅ 验证数据库连接
3. ✅ 检查环境变量配置
4. ✅ 运行数据库修复脚本

### 测试期间
1. ✅ 不要同时运行多个测试实例
2. ✅ 保持网络连接稳定
3. ✅ 避免手动修改测试数据

### 测试后
1. ✅ 查看测试报告
2. ✅ 记录失败的测试用例
3. ✅ 及时修复发现的问题

## 🔄 持续集成

### 添加到 CI/CD 流水线

```yaml
# .github/workflows/test.yml 示例
name: Run Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev &
      - run: sleep 10  # 等待服务器启动
      - run: npm run test
```

### 本地开发工作流

```bash
# 每日开发流程
git pull origin main
npm install
npm run dev &
npm run test
git add .
git commit -m "feat: 新功能"
git push
```

## 📝 扩展测试

### 添加新的测试用例

1. **API 测试**
   - 在 `tests/api.test.js` 中添加新的 describe 块
   - 遵循现有的测试结构和命名规范

2. **前端测试**
   - 在 `tests/frontend.test.js` 中添加新的用户场景
   - 包含适当的清理和错误处理

3. **自定义测试**
   - 创建新的测试文件
   - 在 `scripts/run-tests.js` 中注册新的测试类型

### 测试覆盖率改进

- 增加边界条件测试
- 添加性能基准测试
- 实现可视化回归测试
- 集成安全测试

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的故障排除部分
2. 运行 `npm run test:help` 查看帮助信息  
3. 检查项目的 README.md 文件
4. 查看 `database-setup.md` 了解数据库配置

---

**祝测试愉快！** 🎉

通过完善的测试套件，我们能够确保小星星学习记录应用的稳定性和可靠性，为用户提供最佳的使用体验。 