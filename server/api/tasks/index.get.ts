import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 获取所有任务
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取任务列表失败",
        data: error,
      });
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in tasks API:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
