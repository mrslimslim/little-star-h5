-- 默认奖励数据
-- 在 Supabase SQL Editor 中执行此脚本来创建默认奖励

INSERT INTO
    rewards (
        name,
        description,
        stars_cost,
        icon,
        is_active
    )
VALUES
    -- 娱乐类奖励
    (
        '看动画片30分钟',
        '可以看自己喜欢的动画片',
        3,
        '📺',
        true
    ),
    (
        '玩游戏20分钟',
        '可以玩平板或手机游戏',
        5,
        '🎮',
        true
    ),
    (
        '看电影',
        '和家人一起看一部电影',
        10,
        '🎬',
        true
    ),

-- 美食类奖励
(
    '冰淇淋',
    '选择自己喜欢的口味',
    2,
    '🍦',
    true
),
(
    '小零食',
    '买一包喜欢的小零食',
    3,
    '🍭',
    true
),
(
    '麦当劳套餐',
    '去麦当劳吃一顿',
    8,
    '🍔',
    true
),
(
    '自选晚餐',
    '今晚想吃什么就吃什么',
    6,
    '🍽️',
    true
),

-- 玩具类奖励
(
    '新玩具',
    '买一个心仪已久的小玩具',
    15,
    '🧸',
    true
),
(
    '新绘本',
    '选择一本新的故事书',
    5,
    '📚',
    true
),
(
    '文具用品',
    '买新的文具或贴纸',
    4,
    '✏️',
    true
),

-- 活动类奖励
(
    '游乐园',
    '去游乐园玩一天',
    20,
    '🎡',
    true
),
(
    '户外野餐',
    '和家人一起户外野餐',
    12,
    '🧺',
    true
),
(
    '电影院看电影',
    '去电影院看最新的电影',
    15,
    '🎞️',
    true
),
('游泳', '去游泳馆游泳', 8, '🏊', true),

-- 特殊奖励
(
    '晚睡半小时',
    '今晚可以晚睡30分钟',
    4,
    '🌙',
    true
),
(
    '自由活动券',
    '一整天想做什么就做什么',
    25,
    '🎯',
    true
),
(
    '朋友聚会',
    '邀请朋友来家里玩',
    10,
    '👫',
    true
);

-- 查看插入的数据
SELECT * FROM rewards ORDER BY stars_cost;