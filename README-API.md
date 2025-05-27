# 小星星学习记录 - API 文档

## 概述

本项目已将所有 Supabase 请求移动到服务器端，通过 Nuxt.js 的 API 路由提供安全的数据访问。

## 环境配置

确保在 `.env` 文件中配置以下环境变量：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## API 端点

### 任务管理

#### 获取所有任务
- **GET** `/api/tasks`
- **响应**: `{ success: boolean, data: Task[] }`

#### 创建任务
- **POST** `/api/tasks`
- **请求体**: `{ name: string, default_stars: number, icon?: string }`
- **响应**: `{ success: boolean, data: Task }`

#### 更新任务
- **PUT** `/api/tasks/[id]`
- **请求体**: `{ name?: string, default_stars?: number, icon?: string }`
- **响应**: `{ success: boolean, data: Task }`

#### 删除任务
- **DELETE** `/api/tasks/[id]`
- **响应**: `{ success: boolean, message: string }`

### 每日记录

#### 获取记录列表
- **GET** `/api/daily-records`
- **查询参数**: `start_date?`, `end_date?`, `date?`
- **响应**: `{ success: boolean, data: DailyRecord[] }`

#### 获取特定日期记录
- **GET** `/api/daily-records/[date]`
- **响应**: `{ success: boolean, data: DailyRecord | null }`

#### 保存每日记录
- **POST** `/api/daily-records`
- **请求体**: `{ date: string, completed_tasks: CompletedTask[], notes?: string }`
- **响应**: `{ success: boolean, data: DailyRecord, message: string }`

### 儿童状态

#### 获取儿童状态
- **GET** `/api/child-status`
- **响应**: `{ success: boolean, data: ChildStatus }`

### 奖励系统

#### 获取奖励列表
- **GET** `/api/rewards`
- **响应**: `{ success: boolean, data: Reward[] }`

#### 创建奖励
- **POST** `/api/rewards`
- **请求体**: `{ name: string, description?: string, stars_cost: number, icon?: string, image_url?: string }`
- **响应**: `{ success: boolean, data: Reward, message: string }`

#### 更新奖励
- **PUT** `/api/rewards/[id]`
- **请求体**: `{ name?: string, description?: string, stars_cost?: number, icon?: string, image_url?: string, is_active?: boolean }`
- **响应**: `{ success: boolean, data: Reward, message: string }`

#### 删除奖励
- **DELETE** `/api/rewards/[id]`
- **响应**: `{ success: boolean, message: string }`

#### 兑换奖励
- **POST** `/api/rewards/redeem`
- **请求体**: `{ reward_id: string }`
- **响应**: `{ success: boolean, data: any, message: string }`

### 统计数据

#### 获取统计概览
- **GET** `/api/statistics/overview`
- **响应**: `{ success: boolean, data: StatisticsData }`

## 前端 Composables

### useTasks()
- `fetchTasks()`: 获取任务列表
- `createTask(form)`: 创建新任务
- `updateTask(id, updates)`: 更新任务
- `deleteTask(id)`: 删除任务
- `getTaskById(id)`: 根据ID获取任务
- `searchTasks(query)`: 搜索任务
- `getPopularTasks()`: 获取热门任务
- `validateTaskForm(form)`: 验证表单
- `createDefaultTasks()`: 创建默认任务

### useDailyRecord()
- `fetchRecord(date)`: 获取指定日期记录
- `fetchRecords(params)`: 获取记录列表
- `saveRecord(data)`: 保存每日记录
- `hasRecord(date)`: 检查是否有记录
- `getStarsForDate(date)`: 获取指定日期星星数
- `getRecentRecords(days)`: 获取最近记录
- `getStreakDays()`: 计算连续天数

### useChildStars()
- `fetchChildStatus()`: 获取儿童状态
- `refreshStars()`: 手动刷新星星数据
- `hasEnoughStars(required)`: 检查星星是否足够
- `formatStars(stars)`: 格式化星星显示
- `triggerStarAnimation()`: 触发动画效果

### useRewards()
- `fetchRewards()`: 获取奖励列表
- `createReward(form)`: 创建新奖励
- `updateReward(id, updates)`: 更新奖励
- `deleteReward(id)`: 删除奖励
- `redeemReward(id)`: 兑换奖励
- `getRewardById(id)`: 根据ID获取奖励
- `getAffordableRewards(stars)`: 获取可兑换奖励
- `validateRewardForm(form)`: 验证奖励表单

## 安全性

- 所有数据库操作都在服务器端进行
- 使用 Service Role Key 进行数据库访问
- 客户端只能通过 API 端点访问数据
- 包含适当的错误处理和验证

## 使用示例

```typescript
// 在 Vue 组件中使用
const { tasks, fetchTasks, createTask } = useTasks()
const { childStatus, fetchChildStatus, refreshStars } = useChildStars()

// 获取数据
await fetchTasks()
await fetchChildStatus()

// 创建新任务
await createTask({
  name: '阅读30分钟',
  default_stars: 2,
  icon: '📚'
})

// 在兑换奖励或完成任务后手动刷新星星数据
await refreshStars()

// 发送全局更新事件，通知其他组件刷新
if (process.client) {
  window.dispatchEvent(new CustomEvent('starsUpdated'))
}
```

## 注意事项

1. 确保数据库表结构与类型定义匹配
2. 所有 API 调用都包含错误处理
3. 使用 TypeScript 确保类型安全
4. 服务器端 API 提供统一的响应格式 