<template>
  <div class="list-page">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">📋 学习记录</h2>
      <p class="text-gray-600">查看历史学习成果</p>
    </div>

    <!-- 统计信息 -->
    <div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat-card">
        <div class="text-2xl mb-2">📊</div>
        <div class="text-sm text-gray-600">总记录天数</div>
        <div class="text-xl font-bold text-blue-600">{{ totalDays }} 天</div>
      </div>

      <div class="stat-card">
        <div class="text-2xl mb-2">⭐</div>
        <div class="text-sm text-gray-600">累计获得</div>
        <div class="text-lg font-bold text-green-600">{{ totalStars }} 颗</div>
      </div>

      <div class="stat-card">
        <div class="text-2xl mb-2">💸</div>
        <div class="text-sm text-gray-600">累计消耗</div>
        <div class="text-lg font-bold text-red-600">{{ totalSpent }} 颗</div>
      </div>

      <div class="stat-card">
        <div class="text-2xl mb-2">📈</div>
        <div class="text-sm text-gray-600">总净增长</div>
        <div
          class="text-lg font-bold"
          :class="netStars >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ netStars >= 0 ? "+" : "" }}{{ netStars }} 颗
        </div>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="mb-6 flex flex-wrap gap-3">
      <button
        v-for="filter in filterOptions"
        :key="filter.value"
        @click="currentFilter = filter.value"
        class="filter-btn"
        :class="{ 'filter-btn-active': currentFilter === filter.value }"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 记录列表 -->
    <div class="space-y-4">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin text-4xl mb-2">⭐</div>
        <p class="text-gray-500">加载记录中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredRecords.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无学习记录</h3>
        <p class="text-gray-600 mb-4">开始记录你的学习成果吧！</p>
        <button @click="$router.push(`/day/${today}`)" class="btn-primary">
          记录今天
        </button>
      </div>

      <!-- 记录项 -->
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-item"
        @click="navigateToDay(record.date)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- 日期信息 -->
            <div class="date-info">
              <div class="date-display">
                <span class="day">{{ formatDay(record.date) }}</span>
                <div class="month-year">
                  <span class="month">{{ formatMonth(record.date) }}</span>
                  <span class="year">{{ formatYear(record.date) }}</span>
                </div>
              </div>
              <div class="weekday">{{ formatWeekday(record.date) }}</div>
            </div>

            <!-- 记录详情 -->
            <div class="flex-1">
              <div class="space-y-1 mb-2">
                <!-- 收支统计 -->
                <div class="flex items-center space-x-4 text-sm">
                  <span class="text-green-600">
                    获得: +{{ record.total_stars_earned_today }}⭐
                  </span>
                  <span class="text-red-600">
                    消耗: -{{ record.total_stars_spent_today || 0 }}⭐
                  </span>
                  <span
                    class="font-semibold"
                    :class="
                      (record.net_stars_today || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    净增: {{ (record.net_stars_today || 0) >= 0 ? "+" : ""
                    }}{{
                      record.net_stars_today || record.total_stars_earned_today
                    }}⭐
                  </span>
                </div>
                <!-- 星星可视化 -->
                <div class="flex items-center">
                  <div class="flex">
                    <span
                      v-for="i in Math.min(
                        Math.abs(
                          record.net_stars_today ||
                            record.total_stars_earned_today
                        ),
                        5
                      )"
                      :key="i"
                      class="text-sm"
                      :class="
                        (record.net_stars_today ||
                          record.total_stars_earned_today) >= 0
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      "
                    >
                      {{
                        (record.net_stars_today ||
                          record.total_stars_earned_today) >= 0
                          ? "⭐"
                          : "💫"
                      }}
                    </span>
                    <span
                      v-if="
                        Math.abs(
                          record.net_stars_today ||
                            record.total_stars_earned_today
                        ) > 5
                      "
                      class="text-xs text-gray-500 ml-1"
                    >
                      {{
                        (record.net_stars_today ||
                          record.total_stars_earned_today) >= 0
                          ? "+"
                          : ""
                      }}{{
                        Math.abs(
                          record.net_stars_today ||
                            record.total_stars_earned_today
                        ) - 5
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 完成的任务 -->
              <div
                v-if="
                  record.completed_tasks && record.completed_tasks.length > 0
                "
                class="text-sm text-gray-600"
              >
                <span class="mr-2">完成：</span>
                <span
                  v-for="task in record.completed_tasks.slice(0, 3)"
                  :key="task.id"
                  class="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1"
                >
                  {{ task.task_name }}
                </span>
                <span
                  v-if="record.completed_tasks.length > 3"
                  class="text-gray-400"
                >
                  等{{ record.completed_tasks.length }}项任务
                </span>
              </div>

              <!-- 虚拟记录提示（只有消耗没有学习的日期） -->
              <div
                v-else-if="
                  record.total_stars_earned_today === 0 &&
                  (record.total_stars_spent_today || 0) > 0
                "
                class="text-sm text-orange-600 bg-orange-50 rounded px-2 py-1 inline-block"
              >
                <span class="mr-1">💸</span>
                仅有消耗记录，无学习活动
              </div>

              <!-- 备注 -->
              <div v-if="record.notes" class="text-sm text-gray-500 mt-1">
                <span class="mr-1">💭</span>
                {{ record.notes }}
              </div>
            </div>
          </div>

          <!-- 箭头 -->
          <div class="text-gray-400">
            <span class="text-lg">→</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !isLoading" class="text-center mt-6">
      <button @click="loadMore" class="btn-secondary">加载更多</button>
    </div>

    <!-- 到顶部按钮 -->
    <button
      v-if="showBackToTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 w-12 h-12 bg-pink-400 hover:bg-pink-500 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-40"
    >
      <span class="text-lg">↑</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns";
import type { DailyRecord, CompletedTask } from "~/types";
import type { Database } from "~/types/supabase";

// 设置页面标题
useHead({
  title: "学习记录列表",
});

// 响应式状态
const records = ref<Array<DailyRecord & { completed_tasks?: CompletedTask[] }>>(
  []
);
const isLoading = ref(false);
const currentFilter = ref("all");
const hasMore = ref(true);
const currentPage = ref(0);
const showBackToTop = ref(false);

const pageSize = 20;

// 不再需要直接使用 Supabase 客户端，通过服务器端 API 访问

// 筛选选项
const filterOptions = [
  { value: "all", label: "全部" },
  { value: "today", label: "今天" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
];

// 计算属性
const today = computed(() => format(new Date(), "yyyy-MM-dd"));

const filteredRecords = computed(() => {
  switch (currentFilter.value) {
    case "today":
      return records.value.filter((record) => isToday(parseISO(record.date)));
    case "week":
      return records.value.filter((record) =>
        isThisWeek(parseISO(record.date), { weekStartsOn: 1 })
      );
    case "month":
      return records.value.filter((record) =>
        isThisMonth(parseISO(record.date))
      );
    default:
      return records.value;
  }
});

const totalDays = computed(() => records.value.length);

const totalStars = computed(() => {
  return records.value.reduce(
    (sum, record) => sum + record.total_stars_earned_today,
    0
  );
});

const totalSpent = computed(() => {
  return records.value.reduce(
    (sum, record) => sum + (record.total_stars_spent_today || 0),
    0
  );
});

const netStars = computed(() => {
  return totalStars.value - totalSpent.value;
});

const averageStars = computed(() => {
  return totalDays.value > 0
    ? Math.round((totalStars.value / totalDays.value) * 10) / 10
    : 0;
});

const averageNet = computed(() => {
  return totalDays.value > 0
    ? Math.round((netStars.value / totalDays.value) * 10) / 10
    : 0;
});

// 方法
const formatDay = (date: string) => {
  return format(parseISO(date), "dd");
};

const formatMonth = (date: string) => {
  return format(parseISO(date), "MM月");
};

const formatYear = (date: string) => {
  return format(parseISO(date), "yyyy");
};

const formatWeekday = (date: string) => {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return "周" + weekdays[parseISO(date).getDay()];
};

const navigateToDay = (date: string) => {
  navigateTo(`/day/${date}`);
};

const fetchRecords = async (loadMore = false) => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    const from = loadMore ? currentPage.value * pageSize : 0;
    const to = from + pageSize - 1;

    // 使用服务器端 API 而不是直接 Supabase 调用
    const response = await $fetch("/api/daily-records", {
      query: {
        from,
        to,
        order: "date:desc",
      },
    });

    if (!response.success) {
      throw new Error("Failed to fetch records");
    }

    const data = response.data || [];

    if (loadMore) {
      records.value.push(...data);
    } else {
      records.value = data;
    }

    hasMore.value = data.length === pageSize;
    if (loadMore) {
      currentPage.value++;
    } else {
      currentPage.value = 1;
    }
  } catch (error) {
    console.error("Error fetching records:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  fetchRecords(true);
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 监听滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

// 监听筛选变化
watch(currentFilter, () => {
  // 筛选变化时不需要重新加载数据，只是过滤显示
});

// 初始化
onMounted(() => {
  fetchRecords();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.list-page {
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  @apply bg-white rounded-2xl p-4 shadow-lg text-center;
}

.filter-btn {
  @apply px-4 py-2 rounded-full border-2 border-gray-200 text-gray-600 hover:border-pink-200 hover:text-pink-600 transition-all duration-200;
}

.filter-btn-active {
  @apply bg-pink-400 border-pink-400 text-white;
}

.record-item {
  @apply bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer;
}

.date-info {
  @apply text-center min-w-[80px];
}

.date-display {
  @apply bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-3 mb-1;
}

.day {
  @apply text-2xl font-bold text-gray-800;
}

.month-year {
  @apply flex flex-col text-xs text-gray-600;
}

.weekday {
  @apply text-xs text-gray-500 font-medium;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .list-page {
    padding: 0 1rem;
  }

  .stat-card {
    @apply p-3;
  }

  .record-item {
    @apply p-3;
  }

  .date-info {
    min-width: 60px;
  }

  .date-display {
    @apply p-2;
  }

  .day {
    @apply text-lg;
  }
}
</style>
