import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, "date");

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: "日期参数是必需的",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 获取指定日期的记录及其完成的任务
    const { data, error } = await supabase
      .from("daily_records")
      .select(
        `
        *,
        completed_tasks (
          *
        )
      `
      )
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") {
      throw createError({
        statusCode: 500,
        statusMessage: "获取每日记录失败",
        data: error,
      });
    }

    // 如果没有记录，返回 null 而不是错误
    return {
      success: true,
      data: data || null,
    };
  } catch (error: any) {
    console.error("Error in daily record API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
