<template>
  <div class="day-record-page">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="$router.back()"
          class="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span class="text-xl">⬅️</span>
        </button>

        <div class="text-center">
          <h2 class="text-xl font-bold text-gray-800">
            {{ formatDate(currentDate) }}
          </h2>
          <p class="text-sm text-gray-500">{{ getWeekDay(currentDate) }}</p>
        </div>

        <button
          @click="$router.push('/rewards')"
          class="p-3 rounded-full bg-pink-100 hover:bg-pink-200 transition-all duration-200"
          title="查看奖励中心"
        >
          <span class="text-xl">🎁</span>
        </button>
      </div>

      <!-- 当日星星统计卡片 -->
      <div
        class="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">今日收支</p>
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <p class="text-lg font-bold text-green-600">
                  +{{ earnedStars }}
                </p>
                <p class="text-xs text-gray-500">获得</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-red-600">-{{ spentStars }}</p>
                <p class="text-xs text-gray-500">消耗</p>
              </div>
              <div class="text-center">
                <p class="text-xl font-bold text-yellow-600">{{ netStars }}</p>
                <p class="text-xs text-gray-500">净增</p>
              </div>
            </div>
          </div>
          <div class="text-4xl">
            {{ netStars > 0 ? "🌟" : netStars < 0 ? "💫" : "⭐" }}
          </div>
        </div>
      </div>
    </div>

    <!-- 选项卡切换 -->
    <div class="mb-6">
      <div class="flex bg-gray-100 rounded-2xl p-1">
        <button
          @click="activeTab = 'earn'"
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'earn' }"
        >
          <span class="text-lg mr-2">⭐</span>
          获得星星
        </button>
        <button
          @click="activeTab = 'redeem'"
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'redeem' }"
        >
          <span class="text-lg mr-2">🎁</span>
          兑换奖励
        </button>
      </div>
    </div>

    <!-- 获得星星模块 -->
    <div v-show="activeTab === 'earn'" class="space-y-6">
      <!-- 预设任务 -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">📝</span>
          预设任务
        </h3>
        <div class="space-y-2">
          <div
            v-for="task in availableTasks"
            :key="task.id"
            class="task-item"
            :class="{ 'task-completed': task.is_completed }"
            @click="toggleTask(task)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-xl">{{ task.icon || "📚" }}</div>
                <div>
                  <p class="font-medium text-gray-800">{{ task.name }}</p>
                  <p class="text-xs text-gray-500">
                    +{{ task.default_stars }}⭐
                  </p>
                </div>
              </div>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                :class="
                  task.is_completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                "
              >
                <span v-if="task.is_completed" class="text-white text-xs"
                  >✓</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义任务 -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">✨</span>
          自定义任务
        </h3>

        <!-- 已添加的自定义任务 -->
        <div v-if="customTasks.length > 0" class="space-y-2 mb-4">
          <div
            v-for="(customTask, index) in customTasks"
            :key="`custom-${index}`"
            class="task-item task-completed"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-xl">🎯</div>
                <div>
                  <p class="font-medium text-gray-800">
                    {{ customTask.task_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    +{{ customTask.stars_earned }}⭐
                  </p>
                </div>
              </div>
              <button
                @click="removeCustomTask(index)"
                class="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              >
                <span class="text-red-500 text-xs">✕</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 添加自定义任务表单 -->
        <div
          class="bg-gray-50 rounded-xl p-3 border-2 border-dashed border-gray-200"
        >
          <div class="space-y-3">
            <input
              v-model="newCustomTask.task_name"
              type="text"
              placeholder="输入自定义任务名称"
              class="input-cute text-sm"
              @keyup.enter="addCustomTask"
            />
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-600">奖励星星数：</label>
              <div class="flex items-center space-x-2">
                <button @click="decreaseStars" class="star-btn">-</button>
                <span class="w-6 text-center text-sm font-semibold">{{
                  newCustomTask.stars_earned
                }}</span>
                <button @click="increaseStars" class="star-btn">+</button>
              </div>
            </div>
            <button
              @click="addCustomTask"
              :disabled="!newCustomTask.task_name.trim()"
              class="btn-secondary w-full text-sm"
              :class="{ 'opacity-50': !newCustomTask.task_name.trim() }"
            >
              添加任务
            </button>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">💭</span>
          今日备注
        </h3>
        <textarea
          v-model="notes"
          placeholder="记录今天的学习心得..."
          class="input-cute resize-none h-16 text-sm"
        ></textarea>
      </div>
    </div>

    <!-- 兑换奖励模块 -->
    <div v-show="activeTab === 'redeem'" class="space-y-6">
      <!-- 快速兑换奖励 -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">🎁</span>
          快速兑换
          <CommonStarDisplay size="small" class="ml-2" />
        </h3>

        <!-- 加载状态 -->
        <div v-if="rewardsLoading" class="text-center py-4">
          <div class="animate-pulse text-2xl">🎁</div>
          <p class="text-gray-500 text-sm">加载奖励中...</p>
        </div>

        <!-- 奖励列表 -->
        <div v-else class="space-y-3">
          <div
            v-if="quickRewards.length === 0"
            class="text-center py-8 bg-gray-50 rounded-xl"
          >
            <div class="text-4xl mb-2">🎁</div>
            <p class="text-gray-500 text-sm">暂无可兑换的奖励</p>
            <button
              @click="$router.push('/rewards')"
              class="btn-secondary text-sm mt-2"
            >
              查看全部奖励
            </button>
          </div>

          <div
            v-for="reward in quickRewards"
            :key="reward.id"
            class="reward-item"
            :class="{
              'reward-available': canAfford(reward),
              'reward-unavailable': !canAfford(reward),
            }"
            @click="canAfford(reward) && confirmQuickRedeem(reward)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-xl">{{ reward.icon || "🎁" }}</div>
                <div>
                  <p class="font-medium text-gray-800">{{ reward.name }}</p>
                  <p class="text-xs text-gray-500">
                    需要 {{ reward.stars_cost }}⭐
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <div v-if="canAfford(reward)" class="text-green-600 text-xs">
                  可兑换
                </div>
                <div v-else class="text-red-500 text-xs">星星不足</div>
                <button
                  v-if="canAfford(reward)"
                  @click.stop="confirmQuickRedeem(reward)"
                  class="btn-primary text-xs px-3 py-1"
                  :disabled="isRedeeming"
                >
                  兑换
                </button>
              </div>
            </div>
          </div>

          <!-- 查看更多奖励 -->
          <div class="text-center pt-2">
            <button
              @click="$router.push('/rewards')"
              class="text-pink-500 text-sm hover:underline"
            >
              查看全部奖励 →
            </button>
          </div>
        </div>
      </div>

      <!-- 自定义消耗事件 -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">💰</span>
          自定义消耗
        </h3>

        <!-- 已添加的自定义消耗事件 -->
        <div v-if="customSpendingEvents.length > 0" class="space-y-2 mb-4">
          <div
            v-for="(spendingEvent, index) in customSpendingEvents"
            :key="`spending-${index}`"
            class="spending-item"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-xl">💸</div>
                <div>
                  <p class="font-medium text-gray-800">
                    {{ spendingEvent.event_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    消耗 {{ spendingEvent.stars_cost }}⭐
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  @click="confirmCustomSpending(spendingEvent)"
                  class="btn-primary text-xs px-3 py-1"
                  :disabled="
                    isRedeeming || totalStars < spendingEvent.stars_cost
                  "
                >
                  {{
                    totalStars < spendingEvent.stars_cost
                      ? "星星不足"
                      : "确认消耗"
                  }}
                </button>
                <button
                  @click="removeCustomSpending(index)"
                  class="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <span class="text-red-500 text-xs">✕</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加自定义消耗事件表单 -->
        <div
          class="bg-gray-50 rounded-xl p-3 border-2 border-dashed border-gray-200"
        >
          <div class="space-y-3">
            <input
              v-model="newCustomSpending.event_name"
              type="text"
              placeholder="输入消耗事件名称（如：主动要求去游乐场）"
              class="input-cute text-sm"
              @keyup.enter="addCustomSpending"
            />
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-600">消耗星星数：</label>
              <div class="flex items-center space-x-2">
                <button @click="decreaseSpendingStars" class="star-btn">
                  -
                </button>
                <span class="w-6 text-center text-sm font-semibold">{{
                  newCustomSpending.stars_cost
                }}</span>
                <button @click="increaseSpendingStars" class="star-btn">
                  +
                </button>
              </div>
            </div>
            <button
              @click="addCustomSpending"
              :disabled="!newCustomSpending.event_name.trim()"
              class="btn-secondary w-full text-sm"
              :class="{ 'opacity-50': !newCustomSpending.event_name.trim() }"
            >
              添加消耗事件
            </button>
          </div>
        </div>
      </div>

      <!-- 今日兑换记录 -->
      <div v-if="todayRedemptions.length > 0">
        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span class="text-xl mr-2">📋</span>
          今日消耗记录
        </h3>
        <div class="space-y-2">
          <div
            v-for="redemption in todayRedemptions"
            :key="redemption.id"
            class="bg-red-50 border border-red-100 rounded-xl p-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="text-lg">
                  {{
                    redemption.reward_description === "自定义消耗事件"
                      ? "💸"
                      : "🎁"
                  }}
                </div>
                <div>
                  <p class="font-medium text-gray-800">
                    {{ redemption.reward_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatTime(redemption.redeemed_at) }}
                  </p>
                </div>
              </div>
              <div class="text-red-600 font-medium">
                -{{ redemption.stars_cost }}⭐
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-8 space-y-3">
      <button
        v-if="activeTab === 'earn'"
        @click="saveRecord"
        :disabled="
          isLoading || (!hasCompletedTasks && customTasks.length === 0)
        "
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
        v-if="existingRecord && activeTab === 'earn'"
        @click="deleteRecord"
        :disabled="isLoading"
        class="w-full py-3 px-6 rounded-full border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all duration-200"
      >
        删除今日记录
      </button>
    </div>

    <!-- 成功提示弹窗 -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4">
        <div class="text-center">
          <div class="text-4xl mb-3">🎉</div>
          <h4 class="text-lg font-bold text-gray-800 mb-2">
            {{ successMessage.title }}
          </h4>
          <p class="text-gray-600 mb-4">{{ successMessage.content }}</p>
          <button @click="closeSuccess" class="btn-primary">
            {{ successMessage.button }}
          </button>
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
  Reward,
  RedeemedReward,
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
const activeTab = ref<"earn" | "redeem">("earn");

// 奖励相关状态
const quickRewards = ref<Reward[]>([]);
const rewardsLoading = ref(false);
const isRedeeming = ref(false);
const todayRedemptions = ref<RedeemedReward[]>([]);

// 自定义消耗事件状态
const customSpendingEvents = ref<
  Array<{
    event_name: string;
    stars_cost: number;
  }>
>([]);

// 新自定义消耗事件表单
const newCustomSpending = ref({
  event_name: "",
  stars_cost: 1,
});

// 成功消息
const successMessage = ref({
  title: "太棒了！",
  content: "",
  button: "继续加油！",
});

// 新自定义任务表单
const newCustomTask = ref<CustomTaskForm>({
  task_name: "",
  stars_earned: 1,
});

// 使用composables
const { tasks, fetchTasks } = useTasks();
const { totalStars, refreshStars } = useChildStars();

// 计算属性
const earnedStars = computed(() => {
  const completedStars = availableTasks.value
    .filter((task) => task.is_completed)
    .reduce((sum, task) => sum + task.default_stars, 0);
  const customStars = customTasks.value.reduce(
    (sum, task) => sum + task.stars_earned,
    0
  );
  return completedStars + customStars;
});

const spentStars = computed(() => {
  const redemptionCost = todayRedemptions.value.reduce(
    (sum, redemption) => sum + redemption.stars_cost,
    0
  );
  const customSpendingCost = customSpendingEvents.value.reduce(
    (sum, event) => sum + event.stars_cost,
    0
  );
  return redemptionCost + customSpendingCost;
});

const netStars = computed(() => {
  return earnedStars.value - spentStars.value;
});

const hasCompletedTasks = computed(() => {
  return availableTasks.value.some((task) => task.is_completed);
});

// 奖励相关方法
const canAfford = (reward: Reward): boolean => {
  return totalStars.value >= reward.stars_cost;
};

const loadQuickRewards = async () => {
  try {
    rewardsLoading.value = true;
    const response = await $fetch("/api/rewards");
    if (response.success) {
      // 只显示前6个奖励，按星星消耗排序
      quickRewards.value = response.data
        .filter((reward: Reward) => reward.is_active)
        .sort((a: Reward, b: Reward) => a.stars_cost - b.stars_cost)
        .slice(0, 6);
    }
  } catch (error) {
    console.error("Error loading rewards:", error);
  } finally {
    rewardsLoading.value = false;
  }
};

const loadTodayRedemptions = async () => {
  try {
    const response = await $fetch(`/api/redeemed-rewards?date=${dateParam}`);
    if (response.success) {
      todayRedemptions.value = response.data;
    }
  } catch (error) {
    console.error("Error loading today redemptions:", error);
  }
};

const confirmQuickRedeem = async (reward: Reward) => {
  if (
    !confirm(
      `确定要兑换 ${reward.name} 吗？将消耗 ${reward.stars_cost} 颗星星。`
    )
  ) {
    return;
  }

  try {
    isRedeeming.value = true;
    const response = await $fetch("/api/rewards/redeem", {
      method: "POST",
      body: { reward_id: reward.id },
    });

    if (response.success) {
      successMessage.value = {
        title: "兑换成功！",
        content: `恭喜你获得了${reward.name}！`,
        button: "太棒了！",
      };
      showSuccess.value = true;

      // 刷新数据
      await Promise.all([refreshStars(), loadTodayRedemptions()]);

      // 发送全局更新事件
      if (process.client) {
        window.dispatchEvent(new CustomEvent("starsUpdated"));
      }
    } else {
      alert("兑换失败，请重试");
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    alert("兑换失败，请重试");
  } finally {
    isRedeeming.value = false;
  }
};

// 自定义消耗事件管理
const addCustomSpending = () => {
  if (!newCustomSpending.value.event_name.trim()) return;

  // 检查是否有足够的星星
  if (totalStars.value < newCustomSpending.value.stars_cost) {
    alert(
      `星星不足！需要 ${newCustomSpending.value.stars_cost} 颗星星，当前只有 ${totalStars.value} 颗`
    );
    return;
  }

  customSpendingEvents.value.push({
    event_name: newCustomSpending.value.event_name.trim(),
    stars_cost: newCustomSpending.value.stars_cost,
  });

  // 重置表单
  newCustomSpending.value = {
    event_name: "",
    stars_cost: 1,
  };
};

const removeCustomSpending = (index: number) => {
  customSpendingEvents.value.splice(index, 1);
};

const increaseSpendingStars = () => {
  if (newCustomSpending.value.stars_cost < totalStars.value) {
    newCustomSpending.value.stars_cost++;
  }
};

const decreaseSpendingStars = () => {
  if (newCustomSpending.value.stars_cost > 1) {
    newCustomSpending.value.stars_cost--;
  }
};

const confirmCustomSpending = async (event: {
  event_name: string;
  stars_cost: number;
}) => {
  if (
    !confirm(
      `确定要记录"${event.event_name}"吗？将消耗 ${event.stars_cost} 颗星星。`
    )
  ) {
    return;
  }

  try {
    isRedeeming.value = true;

    // 直接记录为兑换记录（使用现有的 API）
    const response = await $fetch("/api/rewards/redeem", {
      method: "POST",
      body: {
        custom_event: {
          name: event.event_name,
          stars_cost: event.stars_cost,
        },
      },
    });

    if (response.success) {
      successMessage.value = {
        title: "记录成功！",
        content: `已记录"${event.event_name}"，消耗了 ${event.stars_cost} 颗星星`,
        button: "确定",
      };
      showSuccess.value = true;

      // 从待处理列表中移除
      const index = customSpendingEvents.value.findIndex(
        (e) =>
          e.event_name === event.event_name && e.stars_cost === event.stars_cost
      );
      if (index > -1) {
        customSpendingEvents.value.splice(index, 1);
      }

      // 刷新数据
      await Promise.all([refreshStars(), loadTodayRedemptions()]);

      // 发送全局更新事件
      if (process.client) {
        window.dispatchEvent(new CustomEvent("starsUpdated"));
      }
    } else {
      alert("记录失败，请重试");
    }
  } catch (error) {
    console.error("Error recording custom spending:", error);
    alert("记录失败，请重试");
  } finally {
    isRedeeming.value = false;
  }
};

// 原有方法保持不变
const formatDate = (date: Date) => {
  return format(date, "yyyy年MM月dd日");
};

const getWeekDay = (date: Date) => {
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weekDays[date.getDay()];
};

const formatTime = (dateTime: string) => {
  return format(new Date(dateTime), "HH:mm");
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
    const response = await $fetch(`/api/daily-records/${dateParam}`);

    if (response.success && response.data) {
      const data = response.data;
      existingRecord.value = data;
      notes.value = data.notes || "";

      // 恢复任务完成状态
      const completedTaskNames =
        data.completed_tasks?.map((t: any) => t.task_name) || [];
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
      successMessage.value = {
        title: "保存成功！",
        content: `今天获得了 ${earnedStars.value} 颗星星！`,
        button: "继续加油！",
      };
      showSuccess.value = true;

      await refreshStars();
      if (process.client) {
        window.dispatchEvent(new CustomEvent("starsUpdated"));
      }
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

    const response = await $fetch(`/api/daily-records/${dateParam}`, {
      method: "DELETE",
    });

    if (response.success) {
      // 重置状态
      existingRecord.value = null;
      availableTasks.value.forEach((task) => (task.is_completed = false));
      customTasks.value = [];
      notes.value = "";

      await refreshStars();
      if (process.client) {
        window.dispatchEvent(new CustomEvent("starsUpdated"));
      }
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

  // 并行加载数据
  await Promise.all([
    loadExistingRecord(),
    loadQuickRewards(),
    loadTodayRedemptions(),
  ]);
});
</script>

<style scoped>
.day-record-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tab-button {
  @apply flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 text-gray-600 font-medium;
}

.tab-active {
  @apply bg-white text-gray-800 shadow-md;
}

.task-item {
  @apply bg-white rounded-xl p-3 border border-gray-100 hover:border-pink-200 transition-all duration-200 cursor-pointer;
}

.task-completed {
  @apply bg-green-50 border-green-200;
}

.reward-item {
  @apply bg-white rounded-xl p-3 border border-gray-100 transition-all duration-200;
}

.reward-available {
  @apply hover:border-green-200 cursor-pointer;
}

.reward-unavailable {
  @apply opacity-60;
}

.spending-item {
  @apply bg-white rounded-xl p-3 border border-orange-100 hover:border-orange-200 transition-all duration-200;
}

.star-btn {
  @apply w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs transition-colors;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .day-record-page {
    padding: 0 0.75rem;
  }

  .task-item,
  .reward-item {
    padding: 0.75rem;
  }
}
</style>
