import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证请求数据
    if (!body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: "日期是必需的",
      });
    }

    if (!body.completed_tasks || !Array.isArray(body.completed_tasks)) {
      throw createError({
        statusCode: 400,
        statusMessage: "完成的任务列表是必需的",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 计算总星星数
    const totalStars = body.completed_tasks.reduce(
      (sum: number, task: any) => sum + (task.stars_earned || 0),
      0
    );

    // 开始事务处理
    // 首先创建或更新 daily_record
    const dailyRecordData = {
      date: body.date,
      total_stars_earned_today: totalStars,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
    };

    const { data: dailyRecord, error: dailyRecordError } = await supabase
      .from("daily_records")
      .upsert(dailyRecordData, {
        onConflict: "date",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (dailyRecordError) {
      throw createError({
        statusCode: 500,
        statusMessage: "保存每日记录失败",
        data: dailyRecordError,
      });
    }

    // 删除该日期的所有已完成任务记录
    const { error: deleteError } = await supabase
      .from("completed_tasks")
      .delete()
      .eq("daily_record_id", dailyRecord.id);

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: "清理旧任务记录失败",
        data: deleteError,
      });
    }

    // 插入新的完成任务记录
    if (body.completed_tasks.length > 0) {
      const completedTasksData = body.completed_tasks.map((task: any) => ({
        daily_record_id: dailyRecord.id,
        task_id: task.task_id || null,
        task_name: task.task_name,
        stars_earned: task.stars_earned,
        is_custom: task.is_custom || false,
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("completed_tasks")
        .insert(completedTasksData);

      if (insertError) {
        throw createError({
          statusCode: 500,
          statusMessage: "保存完成任务失败",
          data: insertError,
        });
      }
    }

    // 更新儿童状态中的总星星数
    // 注意：这里需要在数据库中创建相应的函数
    // 暂时跳过这个步骤

    return {
      success: true,
      data: dailyRecord,
      message: "每日记录保存成功",
    };
  } catch (error: any) {
    console.error("Error in save daily record API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
