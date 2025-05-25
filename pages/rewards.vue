<template>
  <div class="rewards-page">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">🎁 奖励中心</h2>
      <p class="text-gray-600">用你的星星兑换心仪的奖励吧！</p>
    </div>

    <!-- 当前星星数显示 -->
    <div class="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-lg">
      <div class="flex items-center justify-center space-x-3">
        <CommonStarDisplay size="large" />
      </div>
    </div>

    <!-- 奖励分类 -->
    <div class="mb-6 flex flex-wrap gap-3">
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
        <button 
          @click="$router.push('/list')"
          class="btn-primary"
        >
          查看学习记录
        </button>
      </div>

      <!-- 奖励卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          class="reward-card"
          :class="{
            'reward-available': canAfford(reward),
            'reward-unavailable': !canAfford(reward)
          }"
          @click="handleRewardClick(reward)"
        >
          <!-- 奖励图标 -->
          <div class="text-center mb-4">
            <div class="reward-icon">
              <span class="text-4xl">{{ reward.icon || '🎁' }}</span>
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

          <!-- 兑换按钮 -->
          <div class="mt-4">
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
          <p class="text-sm text-gray-500 mb-4">
            快去享受你的奖励吧！
          </p>
          <button 
            @click="closeSuccessModal"
            class="btn-primary"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reward } from '~/types'

// 手动导入 composables 以解决自动导入问题
import { useRewards } from '~/composables/useRewards'
import { useChildStars } from '~/composables/useChildStars'

const { rewards, isLoading, fetchRewards, redeemReward } = useRewards()
const { totalStars } = useChildStars()

// 设置页面标题
useHead({
  title: '奖励中心'
})

// 响应式状态
const currentCategory = ref('all')
const showSuccessModal = ref(false)
const redeemedRewardName = ref('')
const isRedeeming = ref(false)

// 移除重复的 composables 声明

// 奖励分类
const categories = [
  { value: 'all', label: '全部', icon: '🎁' },
  { value: 'entertainment', label: '娱乐', icon: '🎮' },
  { value: 'food', label: '美食', icon: '🍎' },
  { value: 'toys', label: '玩具', icon: '🧸' },
  { value: 'activity', label: '活动', icon: '🎪' }
]

// 计算属性
const filteredRewards = computed(() => {
  let filtered = [...rewards.value]

  if (currentCategory.value !== 'all') {
    filtered = filtered.filter(reward => {
      const name = reward.name.toLowerCase()
      switch (currentCategory.value) {
        case 'entertainment':
          return name.includes('动画') || name.includes('电视') || name.includes('游戏')
        case 'food':
          return name.includes('冰淇淋') || name.includes('零食') || name.includes('美食')
        case 'toys':
          return name.includes('玩具') || name.includes('书')
        case 'activity':
          return name.includes('游乐园') || name.includes('公园') || name.includes('活动')
        default:
          return true
      }
    })
  }

  // 按星星数排序，可兑换的在前
  return filtered.sort((a: Reward, b: Reward) => {
    const aCanAfford = canAfford(a)
    const bCanAfford = canAfford(b)
    
    if (aCanAfford && !bCanAfford) return -1
    if (!aCanAfford && bCanAfford) return 1
    
    return a.stars_cost - b.stars_cost
  })
})

// 方法
const canAfford = (reward: Reward): boolean => {
  return totalStars.value >= reward.stars_cost
}

const handleRewardClick = (reward: Reward) => {
  if (canAfford(reward)) {
    confirmRedeem(reward)
  }
}

const confirmRedeem = async (reward: Reward) => {
  if (!confirm(`确定要兑换 ${reward.name} 吗？将消耗 ${reward.stars_cost} 颗星星。`)) {
    return
  }

  try {
    isRedeeming.value = true
    
    const success = await redeemReward(reward.id)
    
    if (success) {
      redeemedRewardName.value = reward.name
      showSuccessModal.value = true
    } else {
      alert('兑换失败，请重试')
    }
  } catch (error) {
    console.error('Error redeeming reward:', error)
    alert('兑换失败，请重试')
  } finally {
    isRedeeming.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  redeemedRewardName.value = ''
}

// 初始化
onMounted(() => {
  fetchRewards()
})
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
}
</style> 