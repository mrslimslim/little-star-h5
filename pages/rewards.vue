<template>
  <div class="rewards-page">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <div class="flex items-center justify-between mb-4">
        <div></div>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">🎁 奖励中心</h2>
          <p class="text-gray-600">
            {{ isManageMode ? "管理奖励设置" : "用你的星星兑换心仪的奖励吧！" }}
          </p>
        </div>
        <button
          @click="isManageMode = !isManageMode"
          class="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors duration-200"
          :title="isManageMode ? '退出管理模式' : '进入管理模式'"
        >
          <span class="text-xl">{{ isManageMode ? "👁️" : "⚙️" }}</span>
        </button>
      </div>
    </div>

    <!-- 当前星星数显示 -->
    <div
      class="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-lg"
    >
      <div class="flex items-center justify-center space-x-3">
        <CommonStarDisplay size="large" />
      </div>
    </div>

    <!-- 奖励分类 -->
    <div class="mb-6 flex flex-wrap gap-3 items-center">
      <button
        v-for="category in categories"
        :key="category.value"
        @click="currentCategory = category.value"
        class="category-btn"
        :class="{ 'category-btn-active': currentCategory === category.value }"
      >
        <span class="text-lg mr-1">{{ category.icon }}</span>
        {{ category.label }}
      </button>

      <!-- 管理模式下的添加奖励按钮 -->
      <button v-if="isManageMode" @click="openRewardForm()" class="btn-secondary ml-auto">
        <span class="text-lg mr-1">➕</span>
        添加奖励
      </button>
    </div>

    <!-- 奖励网格 -->
    <div class="space-y-6">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin text-4xl mb-2">🎁</div>
        <p class="text-gray-500">加载奖励中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredRewards.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎁</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无可用奖励</h3>
        <p class="text-gray-600 mb-4">先去完成任务，收集更多星星吧！</p>
        <button @click="$router.push('/list')" class="btn-primary">查看学习记录</button>
      </div>

      <!-- 奖励卡片 -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        :class="{ 'manage-mode': isManageMode }"
      >
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          class="reward-card"
          :class="{
            'reward-available': canAfford(reward),
            'reward-unavailable': !canAfford(reward),
          }"
          @click="handleRewardClick(reward)"
        >
          <!-- 奖励图标 -->
          <div class="text-center mb-4">
            <div class="reward-icon">
              <span class="text-4xl">{{ reward.icon || "🎁" }}</span>
            </div>
          </div>

          <!-- 奖励信息 -->
          <div class="text-center mb-4">
            <h3 class="font-bold text-gray-800 mb-2">{{ reward.name }}</h3>
            <p v-if="reward.description" class="text-sm text-gray-600 mb-3">
              {{ reward.description }}
            </p>

            <!-- 星星成本 -->
            <div class="flex items-center justify-center space-x-1">
              <span class="text-yellow-500 text-lg">⭐</span>
              <span class="font-semibold text-gray-800">{{ reward.stars_cost }}</span>
              <span class="text-sm text-gray-500">颗星星</span>
            </div>
          </div>

          <!-- 状态指示 -->
          <div class="text-center">
            <div v-if="canAfford(reward)" class="text-green-600 text-sm font-medium">
              ✅ 可以兑换
            </div>
            <div v-else class="text-gray-400 text-sm">
              还需要 {{ reward.stars_cost - totalStars }} 颗星星
            </div>
          </div>

          <!-- 兑换按钮 / 管理按钮 -->
          <div class="mt-4">
            <!-- 普通模式：兑换按钮 -->
            <div v-if="!isManageMode">
              <button
                v-if="canAfford(reward)"
                @click.stop="confirmRedeem(reward)"
                :disabled="isRedeeming"
                class="btn-primary w-full"
                :class="{ 'opacity-50 cursor-not-allowed': isRedeeming }"
              >
                <span v-if="isRedeeming">兑换中...</span>
                <span v-else>立即兑换</span>
              </button>
              <button
                v-else
                disabled
                class="w-full py-2 px-4 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed"
              >
                星星不足
              </button>
            </div>

            <!-- 管理模式：编辑和删除按钮 -->
            <div v-else class="flex space-x-2">
              <button
                @click.stop="openRewardForm(reward)"
                class="flex-1 py-2 px-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              >
                编辑
              </button>
              <button
                @click.stop="confirmDeleteReward(reward)"
                class="flex-1 py-2 px-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换成功弹窗 -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4">
        <div class="text-center">
          <div class="text-4xl mb-3">🎉</div>
          <h4 class="text-lg font-bold text-gray-800 mb-2">兑换成功！</h4>
          <p class="text-gray-600 mb-2">恭喜你获得了</p>
          <p class="font-bold text-pink-600 mb-4">{{ redeemedRewardName }}</p>
          <p class="text-sm text-gray-500 mb-4">快去享受你的奖励吧！</p>
          <button @click="closeSuccessModal" class="btn-primary">太棒了！</button>
        </div>
      </div>
    </div>

    <!-- 奖励编辑表单弹窗 -->
    <div
      v-if="showRewardForm"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
      >
        <div class="mb-4">
          <h4 class="text-lg font-bold text-gray-800 mb-2">
            {{ editingReward ? "编辑奖励" : "添加奖励" }}
          </h4>
        </div>

        <!-- 表单错误提示 -->
        <div
          v-if="formErrors.length > 0"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <ul class="text-red-600 text-sm space-y-1">
            <li v-for="error in formErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <div class="space-y-4">
          <!-- 奖励名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">奖励名称</label>
            <input
              v-model="rewardForm.name"
              type="text"
              placeholder="输入奖励名称"
              class="input-cute"
              maxlength="50"
            />
          </div>

          <!-- 奖励描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >奖励描述（可选）</label
            >
            <textarea
              v-model="rewardForm.description"
              placeholder="描述一下这个奖励"
              class="input-cute resize-none h-20"
              maxlength="200"
            ></textarea>
          </div>

          <!-- 星星消耗 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">星星消耗</label>
            <div class="flex items-center space-x-3">
              <button
                @click="decreaseStars"
                class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">-</span>
              </button>
              <input
                v-model.number="rewardForm.stars_cost"
                type="number"
                min="1"
                max="1000"
                class="w-20 text-center border rounded-lg py-2"
              />
              <button
                @click="increaseStars"
                class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">+</span>
              </button>
            </div>
          </div>

          <!-- 奖励图标 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >奖励图标（可选）</label
            >
            <div class="grid grid-cols-6 gap-2 mb-2">
              <button
                v-for="icon in [
                  '🎁',
                  '🍎',
                  '🧸',
                  '🎮',
                  '📚',
                  '🎪',
                  '🍭',
                  '🎨',
                  '⚽',
                  '🎵',
                  '🏆',
                  '💎',
                ]"
                :key="icon"
                @click="rewardForm.icon = icon"
                class="p-2 text-2xl rounded-lg border-2 hover:bg-gray-50 transition-colors"
                :class="{
                  'border-pink-400 bg-pink-50': rewardForm.icon === icon,
                  'border-gray-200': rewardForm.icon !== icon,
                }"
              >
                {{ icon }}
              </button>
            </div>
            <input
              v-model="rewardForm.icon"
              type="text"
              placeholder="或直接输入表情符号"
              class="input-cute"
              maxlength="10"
            />
          </div>
        </div>

        <!-- 按钮 -->
        <div class="flex space-x-3 mt-6">
          <button
            @click="closeRewardForm"
            class="flex-1 py-2 px-4 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            取消
          </button>
          <button
            @click="saveReward"
            :disabled="isLoading"
            class="flex-1 btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            {{ isLoading ? "保存中..." : editingReward ? "更新" : "创建" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reward, CreateRewardForm } from "~/types";

// 手动导入 composables 以解决自动导入问题
import { useRewards } from "~/composables/useRewards";
import { useChildStars } from "~/composables/useChildStars";

const {
  rewards,
  isLoading,
  fetchRewards,
  redeemReward,
  createReward,
  updateReward,
  deleteReward,
  validateRewardForm,
} = useRewards();
const { totalStars, refreshStars } = useChildStars();

// 设置页面标题
useHead({
  title: "奖励中心",
});

// 响应式状态
const currentCategory = ref("all");
const showSuccessModal = ref(false);
const redeemedRewardName = ref("");
const isRedeeming = ref(false);
const isManageMode = ref(false);
const showRewardForm = ref(false);
const editingReward = ref<Reward | null>(null);
const formErrors = ref<string[]>([]);

// 奖励表单
const rewardForm = ref<CreateRewardForm>({
  name: "",
  description: "",
  stars_cost: 1,
  icon: "",
  image_url: "",
});

// 移除重复的 composables 声明

// 奖励分类
const categories = [
  { value: "all", label: "全部", icon: "🎁" },
  { value: "entertainment", label: "娱乐", icon: "🎮" },
  { value: "food", label: "美食", icon: "🍎" },
  { value: "toys", label: "玩具", icon: "🧸" },
  { value: "activity", label: "活动", icon: "🎪" },
];

// 计算属性
const filteredRewards = computed(() => {
  let filtered = [...rewards.value];

  if (currentCategory.value !== "all") {
    filtered = filtered.filter((reward) => {
      const name = reward.name.toLowerCase();
      switch (currentCategory.value) {
        case "entertainment":
          return name.includes("动画") || name.includes("电视") || name.includes("游戏");
        case "food":
          return (
            name.includes("冰淇淋") || name.includes("零食") || name.includes("美食")
          );
        case "toys":
          return name.includes("玩具") || name.includes("书");
        case "activity":
          return (
            name.includes("游乐园") || name.includes("公园") || name.includes("活动")
          );
        default:
          return true;
      }
    });
  }

  // 按星星数排序，可兑换的在前
  return filtered.sort((a: Reward, b: Reward) => {
    const aCanAfford = canAfford(a);
    const bCanAfford = canAfford(b);

    if (aCanAfford && !bCanAfford) return -1;
    if (!aCanAfford && bCanAfford) return 1;

    return a.stars_cost - b.stars_cost;
  });
});

// 方法
const canAfford = (reward: Reward): boolean => {
  return totalStars.value >= reward.stars_cost;
};

const handleRewardClick = (reward: Reward) => {
  if (canAfford(reward)) {
    confirmRedeem(reward);
  }
};

const confirmRedeem = async (reward: Reward) => {
  if (!confirm(`确定要兑换 ${reward.name} 吗？将消耗 ${reward.stars_cost} 颗星星。`)) {
    return;
  }

  try {
    isRedeeming.value = true;

    const success = await redeemReward(reward.id);

    if (success) {
      redeemedRewardName.value = reward.name;
      showSuccessModal.value = true;
      // 兑换成功后刷新星星数据
      await refreshStars();
      // 发送全局更新事件，通知其他组件刷新
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

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  redeemedRewardName.value = "";
};

// 奖励管理方法
const openRewardForm = (reward?: Reward) => {
  if (reward) {
    // 编辑模式
    editingReward.value = reward;
    rewardForm.value = {
      name: reward.name,
      description: reward.description || "",
      stars_cost: reward.stars_cost,
      icon: reward.icon || "",
      image_url: reward.image_url || "",
    };
  } else {
    // 新建模式
    editingReward.value = null;
    rewardForm.value = {
      name: "",
      description: "",
      stars_cost: 1,
      icon: "",
      image_url: "",
    };
  }
  formErrors.value = [];
  showRewardForm.value = true;
};

const closeRewardForm = () => {
  showRewardForm.value = false;
  editingReward.value = null;
  formErrors.value = [];
};

const saveReward = async () => {
  formErrors.value = validateRewardForm(rewardForm.value);
  if (formErrors.value.length > 0) return;

  try {
    let success = false;

    if (editingReward.value) {
      // 更新现有奖励
      success = await updateReward(editingReward.value.id, rewardForm.value);
    } else {
      // 创建新奖励
      success = await createReward(rewardForm.value);
    }

    if (success) {
      closeRewardForm();
    } else {
      alert(editingReward.value ? "更新奖励失败，请重试" : "创建奖励失败，请重试");
    }
  } catch (error) {
    console.error("Error saving reward:", error);
    alert("保存失败，请重试");
  }
};

const confirmDeleteReward = async (reward: Reward) => {
  if (!confirm(`确定要删除奖励 "${reward.name}" 吗？此操作不可恢复。`)) {
    return;
  }

  try {
    const success = await deleteReward(reward.id);
    if (!success) {
      alert("删除奖励失败，请重试");
    }
  } catch (error) {
    console.error("Error deleting reward:", error);
    alert("删除失败，请重试");
  }
};

// 星星数量调整方法
const increaseStars = () => {
  if (rewardForm.value.stars_cost < 1000) {
    rewardForm.value.stars_cost++;
  }
};

const decreaseStars = () => {
  if (rewardForm.value.stars_cost > 1) {
    rewardForm.value.stars_cost--;
  }
};

// 初始化
onMounted(() => {
  fetchRewards();
});
</script>

<style scoped>
.rewards-page {
  max-width: 1200px;
  margin: 0 auto;
}

.category-btn {
  @apply px-4 py-2 rounded-full border-2 border-gray-200 text-gray-600 hover:border-pink-200 hover:text-pink-600 transition-all duration-200;
}

.category-btn-active {
  @apply bg-pink-400 border-pink-400 text-white;
}

.reward-card {
  @apply bg-white rounded-2xl p-6 shadow-lg transition-all duration-200;
}

.reward-available {
  @apply hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-green-200;
}

.reward-unavailable {
  @apply opacity-75;
}

.reward-icon {
  @apply w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center;
}

/* 管理模式样式 */
.manage-mode .reward-card {
  @apply border-2 border-dashed border-gray-300 hover:border-blue-300;
}

.manage-mode .reward-card:hover {
  @apply transform scale-105;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .rewards-page {
    padding: 0 1rem;
  }

  .reward-card {
    @apply p-4;
  }

  .reward-icon {
    @apply w-12 h-12;
  }

  /* 管理模式下的按钮在手机上垂直排列 */
  .manage-mode .reward-card .flex.space-x-2 {
    @apply flex-col space-x-0 space-y-2;
  }
}
</style>
