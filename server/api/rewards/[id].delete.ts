import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const rewardId = getRouterParam(event, "id");

    if (!rewardId) {
      throw createError({
        statusCode: 400,
        statusMessage: "奖励ID是必需的",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 删除奖励
    const { error } = await supabase
      .from("rewards")
      .delete()
      .eq("id", rewardId);

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "删除奖励失败",
        data: error,
      });
    }

    return {
      success: true,
      message: "奖励删除成功",
    };
  } catch (error: any) {
    console.error("Error in delete reward API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
