// 已迁移到服务端 API，不再需要客户端 Supabase
// 所有数据库操作都通过 /api/* 端点进行

// 如果需要类型支持，可以导入类型
export type { Database } from "~/types/supabase";

// 注意：所有 Supabase 操作现在都通过服务端 API 进行
// 请使用相应的 composables，如：useTasks, useDailyRecord, useChildStars 等
