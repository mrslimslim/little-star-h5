<template>
  <div class="calendar-page">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">📅 学习日历</h2>
      <p class="text-gray-600">点击日期记录今天的学习成果</p>
    </div>

    <!-- 月份导航 -->
    <div
      class="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-lg"
    >
      <button
        @click="previousMonth"
        class="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors duration-200"
      >
        <span class="text-xl">⬅️</span>
      </button>

      <div class="text-center">
        <h3 class="text-xl font-bold text-gray-800">
          {{ currentMonthYear }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ monthStats }}
        </p>
      </div>

      <button
        @click="nextMonth"
        class="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors duration-200"
      >
        <span class="text-xl">➡️</span>
      </button>
    </div>

    <!-- 日历网格 -->
    <div class="calendar-grid bg-white rounded-2xl p-4 shadow-lg">
      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-semibold text-gray-600 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期网格 -->
      <div class="grid grid-cols-7 gap-2">
        <!-- 调试信息 -->
        <div v-if="calendarDays.length === 0" class="col-span-7 text-center py-8 text-gray-500">
          {{ isLoading ? '日历加载中...' : '日历生成中...' }}
        </div>
        
        <div
          v-for="day in calendarDays"
          :key="`${day.date}-${day.day}`"
          class="calendar-day-cell"
          :class="{
            'opacity-40': !day.isCurrentMonth,
            'cursor-pointer': day.isCurrentMonth,
            'cursor-not-allowed': !day.isCurrentMonth,
          }"
          @click="selectDate(day)"
        >
          <div
            class="calendar-day"
            :class="{
              'calendar-day-today': day.isToday,
              'calendar-day-has-record': day.hasRecord,
              'hover:bg-pink-100': day.isCurrentMonth && !day.hasRecord,
              'hover:bg-yellow-300': day.isCurrentMonth && day.hasRecord,
            }"
          >
            <span class="day-number">{{ day.day }}</span>

            <!-- 星星指示器 -->
            <div v-if="day.hasRecord && day.starsEarned" class="stars-indicator">
              <span class="text-xs">⭐{{ day.starsEarned }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日快速操作 -->
    <div
      v-if="todayRecord"
      class="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 shadow-lg"
    >
      <h4 class="text-lg font-bold text-gray-800 mb-2">🎉 今日成果</h4>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600">
            已获得
            <span class="font-bold text-yellow-600">{{
              todayRecord.total_stars_earned_today
            }}</span>
            颗星星
          </p>
        </div>
        <button @click="$router.push(`/day/${todayDate}`)" class="btn-primary text-sm">
          查看详情
        </button>
      </div>
    </div>

    <!-- 快速添加今日记录 -->
    <div
      v-else
      class="mt-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 shadow-lg"
    >
      <h4 class="text-lg font-bold text-gray-800 mb-2">✨ 今天学习了吗？</h4>
      <div class="flex items-center justify-between">
        <p class="text-gray-600">记录今天的学习成果，获得小星星！</p>
        <button @click="$router.push(`/day/${todayDate}`)" class="btn-primary">
          开始记录
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin text-4xl mb-2">⭐</div>
      <p class="text-gray-500">加载日历数据...</p>
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

// Supabase客户端 - 添加错误处理
let supabase: any = null;
try {
  supabase = useSupabaseClient();
} catch (error) {
  console.warn('Supabase client initialization failed:', error);
  supabase = null;
}

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

  const totalStars = monthRecords.reduce(
    (sum, record) => sum + record.total_stars_earned_today,
    0
  );
  const totalDays = monthRecords.length;

  return `本月已记录 ${totalDays} 天，获得 ${totalStars} 颗星星`;
});

// 星期标题
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 生成日历数据
const generateCalendarDays = () => {
  console.log('Generating calendar for:', currentDate.value);
  
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

  console.log('Generated calendar days:', days.length);
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
      const response = await $fetch('/api/daily-records', {
        query: {
          start_date: format(start, "yyyy-MM-dd"),
          end_date: format(end, "yyyy-MM-dd")
        }
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
.calendar-grid {
  max-width: 100%;
}

.calendar-day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day {
  @apply w-full h-full rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative;
  min-height: 60px;
}

.calendar-day-today {
  @apply bg-pink-400 text-white shadow-lg;
}

.calendar-day-has-record {
  @apply bg-yellow-200 text-gray-800;
}

.day-number {
  @apply text-center;
}

.stars-indicator {
  @apply absolute bottom-1 right-1 bg-yellow-400 text-yellow-800 rounded-full px-1;
  font-size: 10px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .calendar-day {
    min-height: 50px;
    @apply text-xs;
  }

  .stars-indicator {
    font-size: 8px;
    @apply px-0.5;
  }
}
</style>
 