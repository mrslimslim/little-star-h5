import type { ChildStatus } from "~/types";

export const useChildStars = () => {
  // 响应式状态
  const childStatus = ref<ChildStatus | null>(null);
  const totalStars = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 获取儿童状态
  const fetchChildStatus = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: ChildStatus }>(
        "/api/child-status"
      );

      childStatus.value = data;
      totalStars.value = data?.total_stars || 0;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取星星数量失败";
      console.error("Error fetching child status:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 手动刷新星星数据的方法
  const refreshStars = async (): Promise<void> => {
    await fetchChildStatus();
  };

  // 检查是否有足够的星星
  const hasEnoughStars = (required: number): boolean => {
    return totalStars.value >= required;
  };

  // 触发星星动画效果
  const triggerStarAnimation = () => {
    // 这里可以触发全局事件或状态，让UI组件播放动画
    const event = new CustomEvent("starsAdded", {
      detail: { totalStars: totalStars.value },
    });
    if (process.client) {
      window.dispatchEvent(event);
    }
  };

  // 格式化星星显示
  const formatStars = (stars: number): string => {
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`;
    }
    return stars.toString();
  };

  // 组件挂载时获取星星数量
  onMounted(() => {
    fetchChildStatus();
  });

  return {
    // 状态
    childStatus: readonly(childStatus),
    totalStars: readonly(totalStars),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    fetchChildStatus,
    refreshStars,
    hasEnoughStars,
    formatStars,
    triggerStarAnimation,
  };
};
