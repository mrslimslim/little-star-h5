<template>
  <div class="star-display">
    <div class="flex items-center justify-center space-x-2">
      <!-- 星星图标 -->
      <div class="relative">
        <div
          class="star text-3xl transition-transform duration-300"
          :class="{ 'star-bounce': isAnimating }"
        >
          ⭐
        </div>

        <!-- 动画效果的额外星星 -->
        <div v-if="showFloatingStars" class="absolute inset-0 pointer-events-none">
          <div
            v-for="i in 3"
            :key="i"
            class="absolute star text-sm animate-ping"
            :style="getFloatingStarStyle(i)"
          >
            ✨
          </div>
        </div>
      </div>

      <!-- 星星数量 -->
      <div class="star-count">
        <span
          class="text-2xl font-bold text-yellow-600 transition-all duration-300"
          :class="{ 'scale-110': isAnimating }"
        >
          {{ displayStars }}
        </span>
        <span class="text-sm text-gray-500 ml-1">颗星星</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="mt-2">
      <div class="animate-pulse text-xs text-gray-400">正在更新...</div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="mt-2">
      <div class="text-xs text-red-400">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: "small" | "medium" | "large";
  showAnimation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "medium",
  showAnimation: true,
});

// 使用星星管理composable
const { totalStars, isLoading, error, formatStars, refreshStars } = useChildStars();

// 动画状态
const isAnimating = ref(false);
const showFloatingStars = ref(false);
const displayStars = ref("0");

// 更新显示的星星数量（带动画效果）
const updateDisplayStars = (targetValue: number) => {
  const current = parseInt(displayStars.value) || 0;
  const target = targetValue;

  if (current === target) {
    displayStars.value = formatStars(target);
    return;
  }

  // 数字递增动画
  const duration = 800;
  const steps = Math.min(Math.abs(target - current), 20);
  const stepValue = (target - current) / steps;
  const stepDuration = duration / steps;

  let currentStep = 0;
  const timer = setInterval(() => {
    currentStep++;
    const value = Math.round(current + stepValue * currentStep);
    displayStars.value = formatStars(value);

    if (currentStep >= steps) {
      clearInterval(timer);
      displayStars.value = formatStars(target);
    }
  }, stepDuration);
};

// 触发动画效果
const triggerAnimation = () => {
  isAnimating.value = true;
  showFloatingStars.value = true;

  // 重置动画状态
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);

  setTimeout(() => {
    showFloatingStars.value = false;
  }, 1000);
};

// 监听星星数量变化，触发动画
watch(
  totalStars,
  (newValue: number, oldValue?: number) => {
    if (oldValue !== undefined && newValue > oldValue && props.showAnimation) {
      triggerAnimation();
    }
    updateDisplayStars(newValue);
  },
  { immediate: true }
);

// 获取浮动星星的样式
const getFloatingStarStyle = (index: number) => {
  const angles = [-30, 0, 30];
  const angle = angles[index - 1];
  const distance = 20 + index * 5;

  return {
    transform: `rotate(${angle}deg) translateY(-${distance}px)`,
    animationDelay: `${index * 100}ms`,
    animationDuration: "1s",
  };
};

// 处理星星更新事件
const handleStarsUpdated = async () => {
  await refreshStars();
};

// 监听全局星星增加事件
onMounted(() => {
  if (process.client) {
    window.addEventListener("starsAdded", triggerAnimation);
    // 监听星星更新事件，用于兑换奖励等场景
    window.addEventListener("starsUpdated", handleStarsUpdated);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("starsAdded", triggerAnimation);
    window.removeEventListener("starsUpdated", handleStarsUpdated);
  }
});

// 根据size调整样式
const sizeClasses = computed(() => {
  switch (props.size) {
    case "small":
      return {
        star: "text-xl",
        count: "text-lg",
        container: "space-x-1",
      };
    case "large":
      return {
        star: "text-4xl",
        count: "text-3xl",
        container: "space-x-3",
      };
    default:
      return {
        star: "text-3xl",
        count: "text-2xl",
        container: "space-x-2",
      };
  }
});
</script>

<style scoped>
.star-display {
  @apply flex flex-col items-center;
}

.star {
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  transition: all 0.3s ease;
}

.star-bounce {
  animation: starBounce 0.6s ease-in-out;
}

@keyframes starBounce {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-5deg);
  }
  50% {
    transform: scale(1.3) rotate(0deg);
  }
  75% {
    transform: scale(1.2) rotate(5deg);
  }
}

.star-count {
  @apply flex items-baseline;
}

/* 浮动星星动画 */
@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.5);
  }
}

.animate-ping {
  animation: floatUp 1s ease-out forwards;
}
</style>
