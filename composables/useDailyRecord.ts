import type { DailyRecord, CompletedTask } from "~/types";

export const useDailyRecord = () => {
  // 响应式状态
  const currentRecord = ref<DailyRecord | null>(null);
  const records = ref<DailyRecord[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 获取指定日期的记录
  const fetchRecord = async (date: string): Promise<DailyRecord | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{
        success: boolean;
        data: DailyRecord | null;
      }>(`/api/daily-records/${date}`);
      currentRecord.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取每日记录失败";
      console.error("Error fetching daily record:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // 获取记录列表
  const fetchRecords = async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DailyRecord[]> => {
    try {
      isLoading.value = true;
      error.value = null;

      const query = new URLSearchParams();
      if (params?.start_date) query.append("start_date", params.start_date);
      if (params?.end_date) query.append("end_date", params.end_date);

      const url = `/api/daily-records${
        query.toString() ? "?" + query.toString() : ""
      }`;
      const { data } = await $fetch<{ success: boolean; data: DailyRecord[] }>(
        url
      );

      records.value = data || [];
      return data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取记录列表失败";
      console.error("Error fetching daily records:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // 保存每日记录
  const saveRecord = async (recordData: {
    date: string;
    completed_tasks: CompletedTask[];
    notes?: string;
  }): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: DailyRecord }>(
        "/api/daily-records",
        {
          method: "POST",
          body: recordData,
        }
      );

      // 更新当前记录
      currentRecord.value = data;

      // 更新记录列表中的对应记录
      const index = records.value.findIndex(
        (record) => record.date === data.date
      );
      if (index !== -1) {
        records.value[index] = data;
      } else {
        records.value.unshift(data);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "保存每日记录失败";
      console.error("Error saving daily record:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 检查指定日期是否有记录
  const hasRecord = (date: string): boolean => {
    return records.value.some((record) => record.date === date);
  };

  // 获取指定日期的星星数
  const getStarsForDate = (date: string): number => {
    const record = records.value.find((record) => record.date === date);
    return record?.total_stars_earned_today || 0;
  };

  // 获取最近N天的记录
  const getRecentRecords = (days: number = 7): DailyRecord[] => {
    return records.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  };

  // 计算连续完成天数
  const getStreakDays = (): number => {
    const sortedRecords = [...records.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      const daysDiff = Math.floor(
        (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return {
    // 状态
    currentRecord: readonly(currentRecord),
    records: readonly(records),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    fetchRecord,
    fetchRecords,
    saveRecord,
    hasRecord,
    getStarsForDate,
    getRecentRecords,
    getStreakDays,
  };
};
