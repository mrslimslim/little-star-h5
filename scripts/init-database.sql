-- ===================================================
-- 小星星学习记录 H5 应用 - 数据库初始化脚本
-- 版本: 1.0
-- 执行方式: 在 Supabase SQL Editor 中完整执行此脚本
-- ===================================================

-- 清理现有数据（如果需要重新初始化）
-- 注意：这会删除所有现有数据，请谨慎使用
-- DROP TABLE IF EXISTS redeemed_rewards CASCADE;
-- DROP TABLE IF EXISTS completed_tasks CASCADE;
-- DROP TABLE IF EXISTS daily_records CASCADE;
-- DROP TABLE IF EXISTS rewards CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS child_status CASCADE;

-- ===================================================
-- 第一步：创建数据库表结构
-- ===================================================

-- 1. 任务库表 (tasks)
-- 存储预设的学习任务，如阅读、写作业等
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- 任务名称（唯一）
    default_stars INTEGER NOT NULL DEFAULT 1 CHECK (
        default_stars > 0
        AND default_stars <= 10
    ), -- 默认星星数（1-10）
    icon TEXT, -- 任务图标（emoji）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 每日记录表 (daily_records)
-- 记录每天的整体学习情况
CREATE TABLE IF NOT EXISTS daily_records (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    date DATE NOT NULL UNIQUE, -- 记录日期（唯一）
    total_stars_earned_today INTEGER NOT NULL DEFAULT 0 CHECK (total_stars_earned_today >= 0), -- 当日获得的总星星数
    notes TEXT, -- 当日备注
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 完成任务详情表 (completed_tasks)
-- 记录具体完成的任务详情
CREATE TABLE IF NOT EXISTS completed_tasks (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE, -- 关联每日记录
    task_name TEXT NOT NULL, -- 任务名称
    stars_awarded INTEGER NOT NULL DEFAULT 1 CHECK (
        stars_awarded > 0
        AND stars_awarded <= 10
    ), -- 获得的星星数
    is_custom BOOLEAN NOT NULL DEFAULT FALSE, -- 是否为自定义任务
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 奖励库表 (rewards)
-- 存储可兑换的奖励
CREATE TABLE IF NOT EXISTS rewards (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL, -- 奖励名称
    description TEXT, -- 奖励描述
    stars_cost INTEGER NOT NULL CHECK (stars_cost > 0), -- 所需星星数
    icon TEXT, -- 奖励图标（emoji）
    image_url TEXT, -- 奖励图片URL（可选）
    category TEXT DEFAULT 'other', -- 奖励分类
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- 是否启用
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 儿童状态表 (child_status)
-- 记录孩子的总体状态（单行记录）
CREATE TABLE IF NOT EXISTS child_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_stars INTEGER NOT NULL DEFAULT 0 CHECK (total_stars >= 0), -- 总星星数
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1) -- 确保只有一行记录
);

-- 6. 奖励兑换记录表 (redeemed_rewards)
-- 记录已兑换的奖励历史
CREATE TABLE IF NOT EXISTS redeemed_rewards (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    reward_name TEXT NOT NULL, -- 兑换的奖励名称
    reward_description TEXT, -- 奖励描述
    stars_cost INTEGER NOT NULL CHECK (stars_cost > 0), -- 消耗的星星数
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 第二步：创建索引以提高查询性能
-- ===================================================

-- 日期索引（最常用的查询条件）
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records (date);

-- 完成任务的关联索引
CREATE INDEX IF NOT EXISTS idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_completed_at ON completed_tasks (completed_at);

-- 奖励相关索引
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON rewards (is_active);

CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards (category);

CREATE INDEX IF NOT EXISTS idx_rewards_stars_cost ON rewards (stars_cost);

-- 兑换记录时间索引
CREATE INDEX IF NOT EXISTS idx_redeemed_rewards_redeemed_at ON redeemed_rewards (redeemed_at);

-- 任务名称索引（用于搜索）
CREATE INDEX IF NOT EXISTS idx_tasks_name ON tasks (name);

-- ===================================================
-- 第三步：设置行级安全策略 (RLS)
-- ===================================================

-- 启用 RLS（行级安全）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

ALTER TABLE child_status ENABLE ROW LEVEL SECURITY;

ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（自用应用，无需复杂权限控制）
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

CREATE POLICY "Allow all operations on daily_records" ON daily_records FOR ALL USING (true);

CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);

CREATE POLICY "Allow all operations on rewards" ON rewards FOR ALL USING (true);

CREATE POLICY "Allow all operations on child_status" ON child_status FOR ALL USING (true);

CREATE POLICY "Allow all operations on redeemed_rewards" ON redeemed_rewards FOR ALL USING (true);

-- ===================================================
-- 第四步：插入初始数据
-- ===================================================

-- 初始化儿童状态记录
INSERT INTO
    child_status (id, total_stars, updated_at)
VALUES (1, 0, NOW()) ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 第五步：创建有用的视图和函数
-- ===================================================

-- 创建更新总星星数的函数
CREATE OR REPLACE FUNCTION update_total_stars()
RETURNS TRIGGER AS $$
BEGIN
    -- 重新计算总星星数
    UPDATE child_status 
    SET total_stars = (
        SELECT COALESCE(SUM(total_stars_earned_today), 0) 
        FROM daily_records
    ) - (
        SELECT COALESCE(SUM(stars_cost), 0) 
        FROM redeemed_rewards
    ),
    updated_at = NOW()
    WHERE id = 1;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：当日常记录变化时自动更新总星星数
DROP TRIGGER IF EXISTS trigger_update_total_stars_on_daily_records ON daily_records;

CREATE TRIGGER trigger_update_total_stars_on_daily_records
    AFTER INSERT OR UPDATE OR DELETE ON daily_records
    FOR EACH ROW EXECUTE FUNCTION update_total_stars();

-- 创建触发器：当兑换奖励时自动更新总星星数
DROP TRIGGER IF EXISTS trigger_update_total_stars_on_redeem ON redeemed_rewards;

CREATE TRIGGER trigger_update_total_stars_on_redeem
    AFTER INSERT OR DELETE ON redeemed_rewards
    FOR EACH ROW EXECUTE FUNCTION update_total_stars();

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间戳触发器
DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON tasks;

CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_daily_records_updated_at ON daily_records;

CREATE TRIGGER trigger_update_daily_records_updated_at
    BEFORE UPDATE ON daily_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_rewards_updated_at ON rewards;

CREATE TRIGGER trigger_update_rewards_updated_at
    BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- 完成！数据库初始化成功
-- ===================================================

-- 查询验证：显示创建的表
SELECT table_name, table_type
FROM information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN (
        'tasks',
        'daily_records',
        'completed_tasks',
        'rewards',
        'child_status',
        'redeemed_rewards'
    )
ORDER BY table_name;

-- 查询验证：显示初始数据统计
SELECT '任务' as 数据类型, COUNT(*) as 数量
FROM tasks
UNION ALL
SELECT '奖励' as 数据类型, COUNT(*) as 数量
FROM rewards
UNION ALL
SELECT '儿童状态' as 数据类型, COUNT(*) as 数量
FROM child_status;

-- 显示当前总星星数
SELECT total_stars as 当前总星星数 FROM child_status WHERE id = 1;