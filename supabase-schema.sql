-- 小星星学习记录 H5 应用数据库结构
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 任务库表 (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    default_stars INTEGER NOT NULL DEFAULT 1,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 每日记录表 (daily_records)
CREATE TABLE IF NOT EXISTS daily_records (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_stars_earned_today INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 完成任务详情表 (completed_tasks)
CREATE TABLE IF NOT EXISTS completed_tasks (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    daily_record_id UUID NOT NULL REFERENCES daily_records (id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    stars_awarded INTEGER NOT NULL DEFAULT 1,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 奖励库表 (rewards)
CREATE TABLE IF NOT EXISTS rewards (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    stars_cost INTEGER NOT NULL,
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 儿童状态表 (child_status)
CREATE TABLE IF NOT EXISTS child_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_stars INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- 6. 奖励兑换记录表 (redeemed_rewards) - 可选
CREATE TABLE IF NOT EXISTS redeemed_rewards (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    reward_name TEXT NOT NULL,
    stars_cost INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records (date);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_daily_record_id ON completed_tasks (daily_record_id);

CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON rewards (is_active);

CREATE INDEX IF NOT EXISTS idx_redeemed_rewards_redeemed_at ON redeemed_rewards (redeemed_at);

-- 插入初始的儿童状态记录
INSERT INTO
    child_status (id, total_stars, updated_at)
VALUES (1, 0, NOW()) ON CONFLICT (id) DO NOTHING;

-- 插入一些默认任务
INSERT INTO
    tasks (name, default_stars, icon)
VALUES ('阅读30分钟', 2, '📚'),
    ('完成作业', 3, '✏️'),
    ('练习钢琴', 2, '🎹'),
    ('整理房间', 1, '🧹'),
    ('帮助家务', 1, '🏠'),
    ('运动锻炼', 2, '⚽'),
    ('早睡早起', 1, '😴'),
    ('刷牙洗脸', 1, '🦷') ON CONFLICT DO NOTHING;

-- 插入一些默认奖励
INSERT INTO
    rewards (
        name,
        description,
        stars_cost,
        icon
    )
VALUES (
        '看30分钟动画片',
        '可以看喜欢的动画片30分钟',
        5,
        '📺'
    ),
    (
        '买一本新书',
        '选择一本喜欢的新书',
        15,
        '📖'
    ),
    (
        '去游乐园玩',
        '周末去游乐园玩一天',
        50,
        '🎠'
    ),
    (
        '吃一次冰淇淋',
        '选择喜欢的冰淇淋口味',
        8,
        '🍦'
    ),
    (
        '和朋友玩游戏',
        '邀请朋友来家里玩',
        20,
        '🎮'
    ),
    (
        '买一个小玩具',
        '选择一个心仪的小玩具',
        25,
        '🧸'
    ),
    (
        '晚睡30分钟',
        '周末可以晚睡30分钟',
        10,
        '🌙'
    ),
    (
        '选择今天的晚餐',
        '可以决定今天吃什么',
        12,
        '🍽️'
    ) ON CONFLICT DO NOTHING;

-- 启用行级安全 (RLS) - 由于是自用应用，可以设置为允许所有操作
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

ALTER TABLE child_status ENABLE ROW LEVEL SECURITY;

ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（自用应用）
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

CREATE POLICY "Allow all operations on daily_records" ON daily_records FOR ALL USING (true);

CREATE POLICY "Allow all operations on completed_tasks" ON completed_tasks FOR ALL USING (true);

CREATE POLICY "Allow all operations on rewards" ON rewards FOR ALL USING (true);

CREATE POLICY "Allow all operations on child_status" ON child_status FOR ALL USING (true);

CREATE POLICY "Allow all operations on redeemed_rewards" ON redeemed_rewards FOR ALL USING (true);