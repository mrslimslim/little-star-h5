import type { Task, CreateTaskForm } from "~/types";

export const useTasks = () => {
  // 响应式状态
  const tasks = ref<Task[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 获取所有任务
  const fetchTasks = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Task[] }>(
        "/api/tasks"
      );
      tasks.value = data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取任务列表失败";
      console.error("Error fetching tasks:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 创建新任务
  const createTask = async (taskForm: CreateTaskForm): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Task }>(
        "/api/tasks",
        {
          method: "POST",
          body: {
            name: taskForm.name.trim(),
            default_stars: taskForm.default_stars,
            icon: taskForm.icon || null,
          },
        }
      );

      // 添加到本地状态
      if (data) {
        tasks.value.push(data);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建任务失败";
      console.error("Error creating task:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新任务
  const updateTask = async (
    id: string,
    updates: Partial<CreateTaskForm>
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await $fetch<{ success: boolean; data: Task }>(
        `/api/tasks/${id}`,
        {
          method: "PUT",
          body: {
            ...updates,
            name: updates.name?.trim(),
          },
        }
      );

      // 更新本地状态
      if (data) {
        const index = tasks.value.findIndex((task) => task.id === id);
        if (index !== -1) {
          tasks.value[index] = data;
        }
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新任务失败";
      console.error("Error updating task:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除任务
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      // 从本地状态移除
      tasks.value = tasks.value.filter((task) => task.id !== id);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除任务失败";
      console.error("Error deleting task:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 根据ID获取任务
  const getTaskById = (id: string): Task | undefined => {
    return tasks.value.find((task) => task.id === id);
  };

  // 根据名称搜索任务
  const searchTasks = (query: string): Task[] => {
    if (!query.trim()) return tasks.value;

    const lowerQuery = query.toLowerCase().trim();
    return tasks.value.filter((task) =>
      task.name.toLowerCase().includes(lowerQuery)
    );
  };

  // 获取常用任务（可以根据使用频率排序，这里简化为按星星数排序）
  const getPopularTasks = (): Task[] => {
    return [...tasks.value]
      .sort((a, b) => b.default_stars - a.default_stars)
      .slice(0, 5);
  };

  // 验证任务表单
  const validateTaskForm = (form: CreateTaskForm): string[] => {
    const errors: string[] = [];

    if (!form.name.trim()) {
      errors.push("任务名称不能为空");
    }

    if (form.name.trim().length > 50) {
      errors.push("任务名称不能超过50个字符");
    }

    if (form.default_stars < 1) {
      errors.push("星星数量至少为1");
    }

    if (form.default_stars > 10) {
      errors.push("星星数量不能超过10");
    }

    // 检查是否有重名任务
    const existingTask = tasks.value.find(
      (task) =>
        task.name.toLowerCase().trim() === form.name.toLowerCase().trim()
    );
    if (existingTask) {
      errors.push("已存在同名任务");
    }

    return errors;
  };

  // 批量创建默认任务
  const createDefaultTasks = async (): Promise<boolean> => {
    const defaultTasks: CreateTaskForm[] = [
      { name: "阅读30分钟", default_stars: 2, icon: "📚" },
      { name: "完成作业", default_stars: 3, icon: "✏️" },
      { name: "练习钢琴", default_stars: 2, icon: "🎹" },
      { name: "整理房间", default_stars: 1, icon: "🧹" },
      { name: "帮助家务", default_stars: 1, icon: "🏠" },
      { name: "运动锻炼", default_stars: 2, icon: "⚽" },
      { name: "早睡早起", default_stars: 1, icon: "😴" },
      { name: "刷牙洗脸", default_stars: 1, icon: "🦷" },
    ];

    try {
      isLoading.value = true;
      error.value = null;

      // 批量创建任务
      for (const task of defaultTasks) {
        await createTask(task);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建默认任务失败";
      console.error("Error creating default tasks:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 组件挂载时获取任务列表
  onMounted(() => {
    fetchTasks();
  });

  return {
    // 状态
    tasks: readonly(tasks),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    searchTasks,
    getPopularTasks,
    validateTaskForm,
    createDefaultTasks,
  };
};
