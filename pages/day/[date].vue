<template>
  <div class="day-record-page">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="$router.back()"
          class="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <span class="text-xl">⬅️</span>
        </button>

        <div class="text-center">
          <h2 class="text-xl font-bold text-gray-800">{{ formatDate(currentDate) }}</h2>
          <p class="text-sm text-gray-500">{{ getWeekDay(currentDate) }}</p>
        </div>

        <div class="w-10"></div>
        <!-- 占位元素，保持布局平衡 -->
      </div>

      <!-- 当日星星统计 -->
      <div
        class="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">今日获得</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ todayStars }} <span class="text-sm font-normal">颗星星</span>
            </p>
          </div>
          <div class="text-4xl">{{ todayStars > 0 ? "🌟" : "⭐" }}</div>
        </div>
      </div>
    </div>

    <!-- 预设任务列表 -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <span class="text-xl mr-2">📝</span>
        预设任务
      </h3>

      <div class="space-y-3">
        <div
          v-for="task in availableTasks"
          :key="task.id"
          class="task-item"
          :class="{ 'task-completed': task.is_completed }"
          @click="toggleTask(task)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="text-2xl">{{ task.icon || "📚" }}</div>
              <div>
                <p class="font-semibold text-gray-800">{{ task.name }}</p>
                <p class="text-sm text-gray-500">奖励 {{ task.default_stars }} 颗星星</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                :class="
                  task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                "
              >
                <span v-if="task.is_completed" class="text-white text-sm">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义任务 -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <span class="text-xl mr-2">✨</span>
        自定义任务
      </h3>

      <!-- 已添加的自定义任务 -->
      <div v-if="customTasks.length > 0" class="space-y-3 mb-4">
        <div
          v-for="(customTask, index) in customTasks"
          :key="`custom-${index}`"
          class="task-item task-completed"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="text-2xl">🎯</div>
              <div>
                <p class="font-semibold text-gray-800">{{ customTask.task_name }}</p>
                <p class="text-sm text-gray-500">
                  奖励 {{ customTask.stars_earned }} 颗星星
                </p>
              </div>
            </div>

            <button
              @click="removeCustomTask(index)"
              class="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
            >
              <span class="text-red-500 text-sm">✕</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 添加自定义任务表单 -->
      <div class="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
        <div class="space-y-3">
          <input
            v-model="newCustomTask.task_name"
            type="text"
            placeholder="输入自定义任务名称"
            class="input-cute"
            @keyup.enter="addCustomTask"
          />

          <div class="flex items-center space-x-3">
            <label class="text-sm text-gray-600">奖励星星数：</label>
            <div class="flex items-center space-x-2">
              <button
                @click="decreaseStars"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">-</span>
              </button>
              <span class="w-8 text-center font-semibold">{{
                newCustomTask.stars_earned
              }}</span>
              <button
                @click="increaseStars"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">+</span>
              </button>
            </div>
          </div>

          <button
            @click="addCustomTask"
            :disabled="!newCustomTask.task_name.trim()"
            class="btn-secondary w-full"
            :class="{ 'opacity-50 cursor-not-allowed': !newCustomTask.task_name.trim() }"
          >
            添加自定义任务
          </button>
        </div>
      </div>
    </div>

    <!-- 备注 -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <span class="text-xl mr-2">💭</span>
        备注
      </h3>

      <textarea
        v-model="notes"
        placeholder="记录今天的学习心得或特殊情况..."
        class="input-cute resize-none h-20"
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="space-y-3">
      <button
        @click="saveRecord"
        :disabled="isLoading || (!hasCompletedTasks && customTasks.length === 0)"
        class="btn-primary w-full"
        :class="{
          'opacity-50 cursor-not-allowed':
            isLoading || (!hasCompletedTasks && customTasks.length === 0),
        }"
      >
        <span v-if="isLoading">保存中...</span>
        <span v-else-if="existingRecord">更新今日记录</span>
        <span v-else>保存今日记录</span>
      </button>

      <button
        v-if="existingRecord"
        @click="deleteRecord"
        :disabled="isLoading"
        class="w-full py-3 px-6 rounded-full border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all duration-200"
      >
        删除今日记录
      </button>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4">
        <div class="text-center">
          <div class="text-4xl mb-3">🎉</div>
          <h4 class="text-lg font-bold text-gray-800 mb-2">太棒了！</h4>
          <p class="text-gray-600 mb-4">
            今天获得了
            <span class="font-bold text-yellow-600">{{ todayStars }}</span> 颗星星！
          </p>
          <button @click="closeSuccess" class="btn-primary">继续加油！</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from "date-fns";
import type {
  Task,
  TaskWithCompletion,
  CustomTaskForm,
  DailyRecord,
  CompletedTask,
} from "~/types";

// 获取路由参数
const route = useRoute();
const dateParam = route.params.date as string;

// 设置页面标题
useHead({
  title: `${dateParam} - 学习记录`,
});

// 响应式状态
const currentDate = parseISO(dateParam);
const availableTasks = ref<TaskWithCompletion[]>([]);
const customTasks = ref<CustomTaskForm[]>([]);
const notes = ref("");
const isLoading = ref(false);
const showSuccess = ref(false);
const existingRecord = ref<DailyRecord | null>(null);

// 新自定义任务表单
const newCustomTask = ref<CustomTaskForm>({
  task_name: "",
  stars_earned: 1,
});

// 使用composables
const { tasks, fetchTasks } = useTasks();

// 计算属性
const todayStars = computed(() => {
  const completedStars = availableTasks.value
    .filter((task) => task.is_completed)
    .reduce((sum, task) => sum + task.default_stars, 0);

  const customStars = customTasks.value.reduce((sum, task) => sum + task.stars_earned, 0);

  return completedStars + customStars;
});

const hasCompletedTasks = computed(() => {
  return availableTasks.value.some((task) => task.is_completed);
});

// 方法
const formatDate = (date: Date) => {
  return format(date, "yyyy年MM月dd日");
};

const getWeekDay = (date: Date) => {
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return weekDays[date.getDay()];
};

const toggleTask = (task: TaskWithCompletion) => {
  task.is_completed = !task.is_completed;
};

const increaseStars = () => {
  if (newCustomTask.value.stars_earned < 10) {
    newCustomTask.value.stars_earned++;
  }
};

const decreaseStars = () => {
  if (newCustomTask.value.stars_earned > 1) {
    newCustomTask.value.stars_earned--;
  }
};

const addCustomTask = () => {
  if (!newCustomTask.value.task_name.trim()) return;

  customTasks.value.push({
    task_name: newCustomTask.value.task_name.trim(),
    stars_earned: newCustomTask.value.stars_earned,
  });

  // 重置表单
  newCustomTask.value = {
    task_name: "",
    stars_earned: 1,
  };
};

const removeCustomTask = (index: number) => {
  customTasks.value.splice(index, 1);
};

const loadExistingRecord = async () => {
  try {
    // 使用服务端 API 获取记录详情
    const response = await $fetch(`/api/daily-records/${dateParam}`);

    if (response.success && response.data) {
      const data = response.data;
      existingRecord.value = data;
      notes.value = data.notes || "";

      // 恢复任务完成状态
      const completedTaskNames = data.completed_tasks?.map((t: any) => t.task_name) || [];
      availableTasks.value.forEach((task) => {
        task.is_completed = completedTaskNames.includes(task.name);
      });

      // 恢复自定义任务
      const customCompletedTasks =
        data.completed_tasks?.filter((t: any) => t.is_custom) || [];
      customTasks.value = customCompletedTasks.map((t: any) => ({
        task_name: t.task_name,
        stars_earned: t.stars_earned,
      }));
    }
  } catch (error) {
    console.error("Error loading existing record:", error);
  }
};

const saveRecord = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    // 准备数据
    const completedTasks = [
      // 预设任务
      ...availableTasks.value
        .filter((task) => task.is_completed)
        .map((task) => ({
          task_name: task.name,
          stars_earned: task.default_stars,
          is_custom: false,
        })),
      // 自定义任务
      ...customTasks.value.map((task) => ({
        task_name: task.task_name,
        stars_earned: task.stars_earned,
        is_custom: true,
      })),
    ];

    // 使用服务端 API 保存记录
    const response = await $fetch("/api/daily-records", {
      method: "POST",
      body: {
        date: dateParam,
        completed_tasks: completedTasks,
        notes: notes.value || null,
      },
    });

    if (response.success) {
      existingRecord.value = response.data;
      showSuccess.value = true;
    } else {
      throw new Error(response.message || "保存失败");
    }
  } catch (error) {
    console.error("Error saving record:", error);
    alert("保存失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

const deleteRecord = async () => {
  if (!existingRecord.value || isLoading.value) return;

  if (!confirm("确定要删除今日记录吗？")) return;

  try {
    isLoading.value = true;

    // 使用服务端 API 删除记录
    const response = await $fetch(`/api/daily-records/${dateParam}`, {
      method: "DELETE",
    });

    if (response.success) {
      // 重置状态
      existingRecord.value = null;
      availableTasks.value.forEach((task) => (task.is_completed = false));
      customTasks.value = [];
      notes.value = "";
    } else {
      throw new Error(response.message || "删除失败");
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    alert("删除失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

const closeSuccess = () => {
  showSuccess.value = false;
};

// 初始化
onMounted(async () => {
  await fetchTasks();

  // 将tasks转换为TaskWithCompletion格式
  availableTasks.value = tasks.value.map((task) => ({
    ...task,
    is_completed: false,
  }));

  // 加载现有记录
  await loadExistingRecord();
});
</script>

<style scoped>
.day-record-page {
  max-width: 600px;
  margin: 0 auto;
}

.task-item {
  @apply bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-pink-200 transition-all duration-200 cursor-pointer;
}

.task-completed {
  @apply bg-green-50 border-green-200;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .day-record-page {
    padding: 0 1rem;
  }
}
</style>
