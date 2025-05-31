-- ===================================================
-- 小星星学习记录 - 奖励数据初始化脚本
-- 说明：添加更多奖励数据，方便测试功能
-- ===================================================

-- 插入更多奖励数据，按星星消耗分类
INSERT INTO
    rewards (
        name,
        description,
        stars_cost,
        icon,
        category
    )
VALUES
    -- 低成本奖励 (1-10星星)
    (
        '贴纸奖励',
        '获得一张漂亮的贴纸',
        3,
        '⭐',
        'toys'
    ),
    (
        '选择零食',
        '自己选择今天的小零食',
        5,
        '🍭',
        'food'
    ),
    (
        '额外游戏时间',
        '多玩10分钟电子游戏',
        6,
        '🎮',
        'entertainment'
    ),
    (
        '晚睡10分钟',
        '可以晚10分钟睡觉',
        4,
        '🌙',
        'other'
    ),
    (
        '选择音乐',
        '选择今天听的音乐',
        2,
        '🎵',
        'entertainment'
    ),

-- 中等奖励 (11-25星星)
(
    '电影时间',
    '看一部完整的电影',
    15,
    '🎬',
    'entertainment'
),
(
    '外出散步',
    '和家人一起散步30分钟',
    12,
    '🚶',
    'activity'
),
(
    'DIY手工',
    '做一个简单的手工作品',
    18,
    '🎨',
    'activity'
),
(
    '烘焙时间',
    '和家人一起烘焙小点心',
    20,
    '🧁',
    'food'
),
(
    '朋友视频',
    '和朋友视频聊天30分钟',
    14,
    '📱',
    'entertainment'
),

-- 高级奖励 (26-50星星)
(
    '主题公园',
    '去附近的主题公园玩',
    45,
    '🎢',
    'activity'
),
(
    '新衣服',
    '买一件喜欢的新衣服',
    35,
    '👕',
    'other'
),
(
    '特殊晚餐',
    '去餐厅吃一顿特殊的晚餐',
    40,
    '🍽️',
    'food'
),
(
    '博物馆之旅',
    '参观博物馆或科技馆',
    30,
    '🏛️',
    'activity'
),
(
    '宠物店访问',
    '去宠物店看小动物',
    28,
    '🐕',
    'activity'
),

-- 超级奖励 (50+星星)
(
    '一日游',
    '全家一日游到喜欢的地方',
    80,
    '🚗',
    'activity'
),
(
    '大型玩具',
    '买一个心仪很久的大玩具',
    75,
    '🎁',
    'toys'
),
(
    '游乐园门票',
    '去大型游乐园玩一整天',
    100,
    '🎠',
    'activity'
),
(
    '电子产品',
    '买一个小型电子产品',
    120,
    '📱',
    'other'
),
(
    '度假',
    '周末短途旅行',
    150,
    '✈️',
    'activity'
) ON CONFLICT DO NOTHING;

-- 插入一些任务数据（如果还没有）
INSERT INTO
    tasks (name, default_stars, icon)
VALUES ('帮妈妈做饭', 3, '👩‍🍳'),
    ('洗碗', 2, '🍽️'),
    ('浇花', 1, '🌱'),
    ('整理书桌', 2, '📚'),
    ('学习新单词', 3, '📝'),
    ('练习书法', 2, '✍️'),
    ('画画', 2, '🎨'),
    ('唱歌', 1, '🎤'),
    ('跳舞', 2, '💃'),
    ('做实验', 4, '🔬') ON CONFLICT DO NOTHING;

-- 查看插入的数据统计
SELECT COUNT(*) as 奖励总数, AVG(stars_cost) as 平均星星消耗, MIN(stars_cost) as 最低消耗, MAX(stars_cost) as 最高消耗
FROM rewards
WHERE
    is_active = true;

-- 按星星消耗分组显示
SELECT
    CASE
        WHEN stars_cost <= 10 THEN '低成本 (1-10⭐)'
        WHEN stars_cost <= 25 THEN '中等 (11-25⭐)'
        WHEN stars_cost <= 50 THEN '高级 (26-50⭐)'
        ELSE '超级 (50+⭐)'
    END as 奖励类别,
    COUNT(*) as 数量
FROM rewards
WHERE
    is_active = true
GROUP BY
    CASE
        WHEN stars_cost <= 10 THEN '低成本 (1-10⭐)'
        WHEN stars_cost <= 25 THEN '中等 (11-25⭐)'
        WHEN stars_cost <= 50 THEN '高级 (26-50⭐)'
        ELSE '超级 (50+⭐)'
    END
ORDER BY MIN(stars_cost);