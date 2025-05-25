import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "任务ID是必需的",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 删除任务
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "删除任务失败",
        data: error,
      });
    }

    return {
      success: true,
      message: "任务删除成功",
    };
  } catch (error: any) {
    console.error("Error in delete task API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
