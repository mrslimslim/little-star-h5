// 数据库表对应的类型定义

export interface Task {
  id: string;
  name: string;
  default_stars: number;
  icon: string | null;
  created_at: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  total_stars_earned_today: number;
  notes: string | null;
  created_at: string;
}

export interface CompletedTask {
  id: string;
  daily_record_id: string;
  task_name: string;
  stars_awarded: number;
  is_custom: boolean;
  completed_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  stars_cost: number;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ChildStatus {
  id: number;
  total_stars: number;
  updated_at: string;
}

// 组合类型，用于前端展示
export interface DailyRecordWithTasks extends DailyRecord {
  completed_tasks: CompletedTask[];
}

export interface TaskWithCompletion extends Task {
  is_completed?: boolean;
  stars_earned?: number;
}

// 表单相关类型
export interface CreateTaskForm {
  name: string;
  default_stars: number;
  icon?: string;
}

export interface CreateRewardForm {
  name: string;
  description?: string;
  stars_cost: number;
  icon?: string;
  image_url?: string;
}

export interface CustomTaskForm {
  task_name: string;
  stars_awarded: number;
}

// 视图模式
export type ViewMode = "calendar" | "list";

// 日历相关类型
export interface CalendarDay {
  date: string;
  day: number;
  isToday: boolean;
  hasRecord: boolean;
  starsEarned?: number;
  isCurrentMonth: boolean;
}

// API响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// 统计相关类型
export interface StatsData {
  totalStars: number;
  totalDays: number;
  averageStarsPerDay: number;
  longestStreak: number;
  currentStreak: number;
}
