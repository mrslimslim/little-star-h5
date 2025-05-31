<template>
  <div class="calendar-page">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">📅 学习日历</h2>
      <p class="text-gray-600">点击日期记录今天的学习成果</p>
    </div>

    <!-- 月份导航 -->
    <div
      class="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <button
        @click="previousMonth"
        :disabled="isLoading"
        class="nav-button"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
      >
        <span class="text-xl">⬅️</span>
      </button>

      <div class="text-center transition-all duration-300">
        <h3 class="text-xl font-bold text-gray-800 mb-1">
          {{ currentMonthYear }}
        </h3>
        <p class="text-sm text-gray-500 transition-all duration-300">
          {{ monthStats }}
        </p>
      </div>

      <button
        @click="nextMonth"
        :disabled="isLoading"
        class="nav-button"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
      >
        <span class="text-xl">➡️</span>
      </button>
    </div>

    <!-- 日历网格 -->
    <div
      class="calendar-grid bg-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          v-for="(day, index) in weekDays"
          :key="day"
          class="weekday-header"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期网格 -->
      <div class="grid grid-cols-7 gap-2">
        <!-- 加载状态 -->
        <div
          v-if="calendarDays.length === 0"
          class="col-span-7 text-center py-8 text-gray-500"
        >
          <div class="loading-container">
            <div class="animate-spin text-4xl mb-2">⭐</div>
            <p>{{ isLoading ? "日历加载中..." : "日历生成中..." }}</p>
          </div>
        </div>

        <div
          v-for="(day, index) in calendarDays"
          :key="`${day.date}-${day.day}`"
          class="calendar-day-cell"
          :class="{
            'opacity-40': !day.isCurrentMonth,
            'cursor-pointer': day.isCurrentMonth && !isLoading,
            'cursor-not-allowed': !day.isCurrentMonth || isLoading,
          }"
          :style="{ animationDelay: `${index * 20}ms` }"
          @click="selectDate(day)"
        >
          <div
            class="calendar-day"
            :class="{
              'calendar-day-today': day.isToday,
              'calendar-day-has-record': day.hasRecord,
              'calendar-day-positive': day.hasRecord && (day.netStars || 0) > 0,
              'calendar-day-negative': day.hasRecord && (day.netStars || 0) < 0,
              'calendar-day-zero': day.hasRecord && (day.netStars || 0) === 0,
              'hover:calendar-day-hover': day.isCurrentMonth && !isLoading,
            }"
          >
            <span class="day-number">{{ day.day }}</span>

            <!-- 简化的净值指示器 -->
            <div
              v-if="day.hasRecord && day.netStars !== undefined"
              class="net-indicator"
            >
              <span
                class="net-value"
                :class="{
                  'net-positive': day.netStars > 0,
                  'net-negative': day.netStars < 0,
                  'net-zero': day.netStars === 0,
                }"
              >
                {{ day.netStars > 0 ? "+" : "" }}{{ day.netStars }}
              </span>
            </div>

            <!-- 传统星星指示器（向后兼容） -->
            <div
              v-else-if="day.hasRecord && day.starsEarned"
              class="stars-indicator-legacy"
            >
              <span class="text-yellow-600">+{{ day.starsEarned }}</span>
            </div>

            <!-- 活动指示点 -->
            <div
              v-if="day.hasRecord"
              class="activity-dot"
              :class="{
                'activity-positive': (day.netStars || 0) > 0,
                'activity-negative': (day.netStars || 0) < 0,
                'activity-zero': (day.netStars || 0) === 0,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日快速操作 -->
    <div v-if="todayRecord" class="today-summary">
      <h4 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <span class="celebration-icon">🎉</span>
        <span class="ml-2">今日成果</span>
      </h4>
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <div class="flex items-center space-x-4 text-sm">
            <span class="achievement-badge achievement-earned">
              <span class="icon">⭐</span>
              <span>获得 +{{ todayRecord.total_stars_earned_today }}</span>
            </span>
            <span class="achievement-badge achievement-spent">
              <span class="icon">💸</span>
              <span>消耗 -{{ todayRecord.total_stars_spent_today || 0 }}</span>
            </span>
          </div>
          <div class="net-summary">
            <span class="text-gray-600">净增</span>
            <span
              class="net-amount"
              :class="{
                'net-positive-text': (todayRecord.net_stars_today || 0) >= 0,
                'net-negative-text': (todayRecord.net_stars_today || 0) < 0,
              }"
            >
              {{ (todayRecord.net_stars_today || 0) >= 0 ? "+" : ""
              }}{{ todayRecord.net_stars_today || 0 }}
            </span>
            <span class="text-gray-600">颗星星</span>
          </div>
        </div>
        <button
          @click="$router.push(`/day/${todayDate}`)"
          class="action-button action-button-primary"
        >
          查看详情
        </button>
      </div>
    </div>

    <!-- 快速添加今日记录 -->
    <div v-else class="quick-action">
      <h4 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
        <span class="sparkle-icon">✨</span>
        <span class="ml-2">今天学习了吗？</span>
      </h4>
      <div class="flex items-center justify-between">
        <p class="text-gray-600">记录今天的学习成果，获得小星星！</p>
        <button
          @click="$router.push(`/day/${todayDate}`)"
          class="action-button action-button-primary"
        >
          开始记录
        </button>
      </div>
    </div>

    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <p class="text-gray-600 mt-2">正在加载日历数据...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import type { CalendarDay, DailyRecord } from "~/types";

// 设置页面标题
useHead({
  title: "学习日历",
});

// 响应式状态
const currentDate = ref(new Date());
const calendarDays = ref<CalendarDay[]>([]);
const dailyRecords = ref<DailyRecord[]>([]);
const isLoading = ref(false);

// 注意：已迁移到服务端 API，不再使用客户端 Supabase

// 计算属性
const currentMonthYear = computed(() => {
  return format(currentDate.value, "yyyy年MM月");
});

const todayDate = computed(() => {
  return format(new Date(), "yyyy-MM-dd");
});

const todayRecord = computed(() => {
  return dailyRecords.value.find((record) => record.date === todayDate.value);
});

const monthStats = computed(() => {
  const monthRecords = dailyRecords.value.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === currentDate.value.getMonth() &&
      recordDate.getFullYear() === currentDate.value.getFullYear()
    );
  });

  const totalEarned = monthRecords.reduce(
    (sum, record) => sum + record.total_stars_earned_today,
    0
  );
  const totalSpent = monthRecords.reduce(
    (sum, record) => sum + (record.total_stars_spent_today || 0),
    0
  );
  const netStars = totalEarned - totalSpent;

  // 只计算实际有学习活动的天数（不包括纯消耗的虚拟记录）
  const activeDays = monthRecords.filter(
    (record) => record.total_stars_earned_today > 0
  ).length;

  return `本月活跃 ${activeDays} 天，获得 ${totalEarned} 颗星星，净增 ${
    netStars >= 0 ? "+" : ""
  }${netStars} 颗`;
});

// 星期标题
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 生成日历数据
const generateCalendarDays = () => {
  console.log("Generating calendar for:", currentDate.value);

  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);

  // 获取月份的第一天是星期几
  const startDay = start.getDay();

  // 生成日历数组，包含上个月的尾部日期
  const days: CalendarDay[] = [];

  // 添加上个月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(start);
    date.setDate(date.getDate() - (i + 1));
    days.push({
      date: format(date, "yyyy-MM-dd"),
      day: date.getDate(),
      isToday: isToday(date),
      hasRecord: false,
      isCurrentMonth: false,
    });
  }

  // 添加当前月份的日期
  const monthDays = eachDayOfInterval({ start, end });
  monthDays.forEach((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const record = dailyRecords.value.find((r) => r.date === dateStr);

    days.push({
      date: dateStr,
      day: date.getDate(),
      isToday: isToday(date),
      hasRecord: !!record,
      starsEarned: record?.total_stars_earned_today,
      starsSpent: record?.total_stars_spent_today,
      netStars: record?.net_stars_today,
      isCurrentMonth: true,
    });
  });

  // 添加下个月的日期，补齐6行
  const remainingDays = 42 - days.length; // 6行 * 7列
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(end);
    date.setDate(date.getDate() + i);
    days.push({
      date: format(date, "yyyy-MM-dd"),
      day: date.getDate(),
      isToday: isToday(date),
      hasRecord: false,
      isCurrentMonth: false,
    });
  }

  console.log("Generated calendar days:", days.length);
  calendarDays.value = days;
};

// 获取月份的记录数据
const fetchMonthRecords = async () => {
  try {
    isLoading.value = true;

    const start = startOfMonth(currentDate.value);
    const end = endOfMonth(currentDate.value);

    try {
      // 使用服务器端 API 而不是直接 Supabase 调用
      const response = await $fetch("/api/daily-records", {
        query: {
          start_date: format(start, "yyyy-MM-dd"),
          end_date: format(end, "yyyy-MM-dd"),
        },
      });

      if (response.success) {
        dailyRecords.value = response.data || [];
      } else {
        console.warn("API request failed, using empty data");
        dailyRecords.value = [];
      }
    } catch (dbError) {
      console.warn("API request failed, using empty data:", dbError);
      // 如果API请求失败，使用空数据，但仍然显示日历
      dailyRecords.value = [];
    }

    generateCalendarDays();
  } catch (error) {
    console.error("Error fetching month records:", error);
    // 确保即使出错也显示日历
    dailyRecords.value = [];
    generateCalendarDays();
  } finally {
    isLoading.value = false;
  }
};

// 月份导航
const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1);
  fetchMonthRecords();
};

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1);
  fetchMonthRecords();
};

// 选择日期
const selectDate = (day: CalendarDay) => {
  if (!day.isCurrentMonth) return;

  // 跳转到日期详情页
  navigateTo(`/day/${day.date}`);
};

// 初始化
onMounted(() => {
  // 先生成空的日历，然后再获取数据
  generateCalendarDays();
  fetchMonthRecords();
});
</script>

<style scoped>
/* 基础布局 */
.calendar-grid {
  max-width: 100%;
}

.calendar-day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

/* 日历单元格样式 */
.calendar-day {
  @apply w-full h-full rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-300 relative;
  min-height: 60px;
  transform: scale(1);
}

.calendar-day:hover.hover\:calendar-day-hover {
  transform: scale(1.05);
  @apply shadow-md;
}

.calendar-day-today {
  @apply bg-pink-400 text-white shadow-lg;
  animation: pulse 2s infinite;
}

.calendar-day-has-record {
  @apply bg-yellow-200 text-gray-800;
}

.calendar-day-positive {
  @apply bg-green-100 text-gray-800 border-2 border-green-300;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}

.calendar-day-negative {
  @apply bg-red-100 text-gray-800 border-2 border-red-300;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.calendar-day-zero {
  @apply bg-gray-100 text-gray-800 border-2 border-gray-300;
}

/* 日期数字 */
.day-number {
  @apply text-center font-semibold;
  z-index: 2;
}

/* 星期标题 */
.weekday-header {
  @apply text-center text-sm font-semibold text-gray-600 py-2;
  animation: slideInDown 0.5s ease-out forwards;
  opacity: 0;
}

/* 净值指示器 */
.net-indicator {
  @apply absolute top-0 right-1;
  z-index: 3;
}

.net-value {
  @apply text-[10px] font-bold px-1 py-0.5 rounded leading-none shadow-sm;
  min-width: 18px;
  text-align: center;
  display: inline-block;
  animation: bounceIn 0.6s ease-out;
}

.net-positive {
  @apply bg-green-500 text-white;
}

.net-negative {
  @apply bg-red-500 text-white;
}

.net-zero {
  @apply bg-gray-400 text-white;
}

/* 活动指示点 */
.activity-dot {
  @apply absolute bottom-1 left-1 w-2 h-2 rounded-full;
  animation: scale 0.3s ease-out;
}

.activity-positive {
  @apply bg-green-400;
}

.activity-negative {
  @apply bg-red-400;
}

.activity-zero {
  @apply bg-gray-400;
}

/* 导航按钮 */
.nav-button {
  @apply p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-all duration-200 transform hover:scale-105;
}

.nav-button:active {
  transform: scale(0.95);
}

/* 传统星星指示器 */
.stars-indicator-legacy {
  @apply absolute bottom-1 right-1 bg-yellow-400 text-yellow-800 rounded-full px-1;
  font-size: 10px;
}

/* 今日摘要样式 */
.today-summary {
  @apply mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl;
  animation: slideInUp 0.6s ease-out;
}

.celebration-icon {
  animation: bounce 1s infinite;
}

.achievement-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200;
}

.achievement-earned {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.achievement-spent {
  @apply bg-red-100 text-red-800 border border-red-200;
}

.achievement-badge .icon {
  @apply mr-1;
}

.net-summary {
  @apply flex items-center space-x-1;
}

.net-amount {
  @apply font-bold text-lg;
}

.net-positive-text {
  @apply text-green-600;
}

.net-negative-text {
  @apply text-red-600;
}

/* 快速操作样式 */
.quick-action {
  @apply mt-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl;
  animation: slideInUp 0.6s ease-out;
}

.sparkle-icon {
  animation: sparkle 1.5s ease-in-out infinite;
}

/* 操作按钮 */
.action-button {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105;
}

.action-button-primary {
  @apply bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg;
}

.action-button:active {
  transform: scale(0.95);
}

/* 加载状态 */
.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50;
  backdrop-filter: blur(2px);
}

.loading-content {
  @apply bg-white rounded-2xl p-6 shadow-xl text-center;
}

.loading-container {
  animation: fadeIn 0.3s ease-out;
}

.loading-stars {
  @apply flex justify-center space-x-2;
}

.star {
  @apply text-2xl;
  animation: bounce 1s infinite;
}

/* 动画定义 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

@keyframes scale {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .calendar-day {
    min-height: 50px;
    @apply text-xs;
  }

  .net-value {
    @apply text-[8px] px-0.5 py-0.5;
    min-width: 14px;
  }

  .stars-indicator-legacy {
    font-size: 8px;
    @apply px-0.5;
  }

  .achievement-badge {
    @apply text-[10px] px-2 py-0.5;
  }

  .action-button {
    @apply px-3 py-1.5 text-sm;
  }
}
</style>
