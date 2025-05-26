-- 修复 completed_tasks 表字段名不匹配问题
-- 将 stars_awarded 重命名为 stars_earned
-- 将 completed_at 重命名为 created_at

-- 方案1: 直接重命名列（如果可能）
-- ALTER TABLE completed_tasks RENAME COLUMN stars_awarded TO stars_earned;
-- ALTER TABLE completed_tasks RENAME COLUMN completed_at TO created_at;

-- 方案2: 如果重命名不支持，则删除重建表
-- 首先备份数据
CREATE TABLE completed_tasks_backup AS SELECT * FROM completed_tasks;

-- 删除原表
DROP TABLE completed_tasks;

-- 重新创建表with正确的字段名
CREATE TABLE completed_tasks (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks (id),
    task_name TEXT NOT NULL,
    stars_earned INTEGER NOT NULL DEFAULT 1,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 恢复数据（如果有备份数据）
-- INSERT INTO completed_tasks (id, daily_record_id, task_name, stars_earned, is_custom, created_at)
-- SELECT id, daily_record_id, task_name, stars_awarded, is_custom, completed_at FROM completed_tasks_backup;

-- 删除备份表
-- DROP TABLE completed_tasks_backup;

-- 重新创建索引
CREATE INDEX IF NOT EXISTS idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_task_id ON completed_tasks (task_id);

-- 重新启用RLS
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);