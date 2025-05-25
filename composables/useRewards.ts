import type { Reward } from "~/types";

export const useRewards = () => {
  // 响应式状态
  const rewards = ref<Reward[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 获取奖励列表
  const fetchRewards = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Reward[] }>(
        "/api/rewards"
      );
      rewards.value = data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取奖励列表失败";
      console.error("Error fetching rewards:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 兑换奖励
  const redeemReward = async (rewardId: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch("/api/rewards/redeem", {
        method: "POST",
        body: { reward_id: rewardId },
      });

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "兑换奖励失败";
      console.error("Error redeeming reward:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 根据ID获取奖励
  const getRewardById = (id: string): Reward | undefined => {
    return rewards.value.find((reward) => reward.id === id);
  };

  // 获取可兑换的奖励（根据当前星星数）
  const getAffordableRewards = (availableStars: number): Reward[] => {
    return rewards.value.filter(
      (reward) => reward.is_active && reward.stars_cost <= availableStars
    );
  };

  // 组件挂载时获取奖励列表
  onMounted(() => {
    fetchRewards();
  });

  return {
    // 状态
    rewards: readonly(rewards),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    fetchRewards,
    redeemReward,
    getRewardById,
    getAffordableRewards,
  };
};
