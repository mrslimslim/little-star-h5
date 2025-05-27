import type { Reward, CreateRewardForm } from "~/types";

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

  // 创建新奖励
  const createReward = async (
    rewardForm: CreateRewardForm
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Reward }>(
        "/api/rewards",
        {
          method: "POST",
          body: {
            name: rewardForm.name.trim(),
            description: rewardForm.description?.trim() || null,
            stars_cost: rewardForm.stars_cost,
            icon: rewardForm.icon || null,
            image_url: rewardForm.image_url || null,
          },
        }
      );

      // 添加到本地状态
      if (data) {
        rewards.value.push(data);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建奖励失败";
      console.error("Error creating reward:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新奖励
  const updateReward = async (
    id: string,
    updates: Partial<CreateRewardForm>
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Reward }>(
        `/api/rewards/${id}`,
        {
          method: "PUT",
          body: updates,
        }
      );

      // 更新本地状态
      if (data) {
        const index = rewards.value.findIndex((reward) => reward.id === id);
        if (index !== -1) {
          rewards.value[index] = data;
        }
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新奖励失败";
      console.error("Error updating reward:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除奖励
  const deleteReward = async (id: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/api/rewards/${id}`, {
        method: "DELETE",
      });

      // 从本地状态移除
      const index = rewards.value.findIndex((reward) => reward.id === id);
      if (index !== -1) {
        rewards.value.splice(index, 1);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除奖励失败";
      console.error("Error deleting reward:", err);
      return false;
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

  // 验证奖励表单
  const validateRewardForm = (form: CreateRewardForm): string[] => {
    const errors: string[] = [];

    if (!form.name.trim()) {
      errors.push("奖励名称不能为空");
    }

    if (form.name.trim().length > 50) {
      errors.push("奖励名称不能超过50个字符");
    }

    if (form.stars_cost < 1) {
      errors.push("星星消耗至少为1");
    }

    if (form.stars_cost > 1000) {
      errors.push("星星消耗不能超过1000");
    }

    if (form.description && form.description.trim().length > 200) {
      errors.push("奖励描述不能超过200个字符");
    }

    // 检查是否有重名奖励
    const existingReward = rewards.value.find(
      (reward) =>
        reward.name.toLowerCase().trim() === form.name.toLowerCase().trim()
    );
    if (existingReward) {
      errors.push("已存在同名奖励");
    }

    return errors;
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
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    getRewardById,
    getAffordableRewards,
    validateRewardForm,
  };
};
